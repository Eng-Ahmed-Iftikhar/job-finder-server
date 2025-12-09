/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from 'megajs';

@Injectable()
export class MegaService implements OnModuleInit {
  private readonly logger = new Logger(MegaService.name);
  private storage: Storage;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const email = this.configService.get<string>('MEGA_EMAIL');
      const password = this.configService.get<string>('MEGA_PASSWORD');

      if (!email || !password) {
        this.logger.warn(
          'MEGA credentials not found. File uploads will be disabled.',
        );
        return;
      }

      this.storage = new Storage({ email, password });

      await new Promise((resolve, reject) => {
        this.storage.on('ready', () => {
          this.isConnected = true;
          this.logger.log('Successfully connected to Mega');
          resolve(true);
        });

        this.storage.on('delete', (err: any) => {
          this.logger.error('Failed to connect to Mega:', err);
          reject(new Error(err?.message || 'Failed to connect to Mega'));
        });
      });
    } catch (error) {
      this.logger.error('Failed to initialize Mega service:', error);
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    folderPath?: string,
  ): Promise<{ fileId: string; downloadUrl: string; size: number }> {
    if (!this.isConnected) {
      throw new Error('Mega service not connected');
    }

    try {
      // Find or create folder
      let targetFolder: any = this.storage.root;
      if (folderPath) {
        targetFolder = await this.findOrCreateFolder(folderPath);
      }

      // Upload file
      const file = await new Promise<any>((resolve, reject) => {
        targetFolder.upload(
          {
            name: filename,
            size: fileBuffer.length,
          },
          fileBuffer,
          (err: any, file: any) => {
            if (err) {
              reject(new Error(err?.message || 'Upload failed'));
              return;
            }
            resolve(file);
          },
        );
      });

      // Generate download link
      const downloadUrl = await this.generateDownloadLink(file);

      return {
        fileId: String(file.nodeId),
        downloadUrl,
        size: fileBuffer.length,
      };
    } catch (error) {
      this.logger.error('File upload failed:', error);
      throw new Error(
        `File upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async downloadFile(
    fileId: string,
  ): Promise<{ buffer: Buffer; filename: string; size: number }> {
    if (!this.isConnected) {
      throw new Error('Mega service not connected');
    }

    try {
      // Get file from storage using the correct API
      const file = this.storage.find(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      const buffer = await new Promise<Buffer>((resolve, reject) => {
        file.download({}, (err: any, buffer: Buffer) => {
          if (err) {
            reject(new Error(err?.message || 'Download failed'));
            return;
          }
          resolve(buffer);
        });
      });

      return {
        buffer,
        filename: file.name || '',
        size: file.size || 0,
      };
    } catch (error) {
      this.logger.error('File download failed:', error);
      throw new Error(
        `File download failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Mega service not connected');
    }

    try {
      const file = this.storage.find(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      await new Promise<void>((resolve, reject) => {
        void file.delete(true, (err: any) => {
          if (err) {
            reject(new Error(err?.message || 'Deletion failed'));
            return;
          }
          resolve();
        });
      });

      this.logger.log(`File deleted successfully: ${fileId}`);
    } catch (error) {
      this.logger.error('File deletion failed:', error);
      throw new Error(
        `File deletion failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  listFiles(folderPath?: string): Array<{
    fileId: string;
    name: string;
    size: number;
    type: string;
    createdAt: Date;
  }> {
    if (!this.isConnected) {
      throw new Error('Mega service not connected');
    }

    try {
      let targetFolder: any = this.storage.root;
      if (folderPath) {
        targetFolder = this.findFolder(folderPath);
        if (!targetFolder) {
          return [];
        }
      }

      const children = targetFolder.children || [];
      const files = children.map((item: any) => ({
        fileId: String(item.nodeId ?? ''),
        name: String(item.name ?? ''),
        size: Number(item.size) || 0,
        type: item.directory ? 'folder' : 'file',
        createdAt: new Date((item.timestamp ?? 0) * 1000),
      }));

      return files;
    } catch (error) {
      this.logger.error('File listing failed:', error);
      throw new Error(
        `File listing failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getFileInfo(fileId: string): Promise<{
    fileId: string;
    name: string;
    size: number;
    type: string;
    createdAt: Date;
    downloadUrl: string;
  }> {
    if (!this.isConnected) {
      throw new Error('Mega service not connected');
    }

    try {
      const file = this.storage.find(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      const downloadUrl = await this.generateDownloadLink(file);

      return {
        fileId: file.nodeId || '',
        name: file.name || '',
        size: file.size || 0,
        type: file.directory ? 'folder' : 'file',
        createdAt: new Date(file.timestamp || 0),
        downloadUrl,
      };
    } catch (error) {
      this.logger.error('File info retrieval failed:', error);
      throw new Error(
        `File info retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async findOrCreateFolder(folderPath: string): Promise<any> {
    const folders = folderPath.split('/').filter(Boolean);
    let currentFolder: any = this.storage.root;

    for (const folderName of folders) {
      const children = currentFolder.children || [];
      let folder = children.find(
        (child: any) => child?.directory && child?.name === folderName,
      );

      if (!folder) {
        // Create folder if it doesn't exist
        folder = await new Promise<any>((resolve, reject) => {
          currentFolder.mkdir(folderName, (err: any, newFolder: any) => {
            if (err) {
              reject(new Error(err?.message || 'Failed to create folder'));
              return;
            }
            resolve(newFolder);
          });
        });
      }

      if (folder) {
        currentFolder = folder;
      }
    }

    return currentFolder;
  }

  private findFolder(folderPath: string): any {
    const folders = folderPath.split('/').filter(Boolean);
    let currentFolder: any = this.storage.root;

    for (const folderName of folders) {
      const children = currentFolder.children || [];
      const folder = children.find(
        (child: any) => child?.directory && child?.name === folderName,
      );

      if (!folder) {
        return null;
      }

      currentFolder = folder;
    }

    return currentFolder;
  }

  public async generateDownloadLink(file: any): Promise<string> {
    try {
      if (!file || typeof file.link !== 'function') {
        throw new Error('Invalid file object');
      }

      const link = await new Promise<string>((resolve, reject) => {
        file.link((err: any, link: string) => {
          if (err) {
            reject(new Error(err?.message || 'Failed to generate link'));
            return;
          }
          resolve(link);
        });
      });

      return link;
    } catch (error) {
      this.logger.error('Failed to generate download link:', error);
      return '';
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  async reconnect(): Promise<void> {
    this.isConnected = false;
    await this.connect();
  }
}
