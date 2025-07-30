export interface ChatRoom {
    id?: string,
    chatRoomType: "PRIVATE" | "GROUP",
    usersInChat: string[],
    name?: string,
}