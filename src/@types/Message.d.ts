export interface Message {
    id?: string;
    chatRoomId: string;
    senderUsername: string;
    receiverUsername: string;
    content: string;
    sendAt?: Date;
}