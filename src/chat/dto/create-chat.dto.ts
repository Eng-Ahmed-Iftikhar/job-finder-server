export class CreateChatDto {
  type: 'PRIVATE' | 'GROUP';
  userIds: string[]; // For PRIVATE, 2 users; for GROUP, multiple
  groupName?: string;
  groupIcon?: string;
}
