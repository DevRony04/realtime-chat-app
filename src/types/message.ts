export interface Message {
  $id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
  tempId?: string;
}
