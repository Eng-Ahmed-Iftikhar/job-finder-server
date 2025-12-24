export class SendMessageDto {
  senderId: string;
  text?: string;
  fileUrl?: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
}
