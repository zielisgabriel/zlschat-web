export interface Message {
    id?: string;
    tempId: string;
    chatRoomId: string;
    senderUsername: string;
    receiverUsername: string;
    content: string;
    status: "SENDING" | "SENT" | "READ"
    sendAt?: Date;
}