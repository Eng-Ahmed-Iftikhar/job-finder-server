export class UpdateMessageDto {
  text?: string;
  fileUrl?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
  status?: 'SENT' | 'FAILED';
}
