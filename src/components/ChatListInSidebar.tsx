"use client";

import { ChatRoom } from "@/@types/ChatRoom";
import { api } from "@/lib/api";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import clsx from "clsx";

interface ChatListInSidebarProps {
    onLoadChatRoom: (chatId: string) => Promise<void>;
}

export function ChatListInSidebar(props: ChatListInSidebarProps) {
    const [chats, setChats] = useState<ChatRoom[]>([]);
    const {profile, chatAndMessagesInChat} = useContext(ApplicationContext);

    async function onFetchChats() {
        try {
            const response = await api.get("/api/chat/list");
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            setChats(response.data);
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        onFetchChats();
    }, []);

    if (chats.length === 0) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <button className="cursor-pointer" onClick={onFetchChats}>
                        Nenhum chat encontrado
                    </button>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        chats.map((chat, index) => (
            <SidebarMenuItem
                key={index}
                className={clsx(
                "rounded-md",
                chat.id === chatAndMessagesInChat?.chatRoom.id && "bg-secondary"
            )}>
                <SidebarMenuButton asChild>
                    <button className="cursor-pointer" onClick={async () => await props.onLoadChatRoom(chat.id!)}>
                        <Avatar>
                            <AvatarFallback>
                                {
                                    chat.usersInChat.find((user) => user !== profile?.username)?.toUpperCase().charAt(0)
                                }
                            </AvatarFallback>
                        </Avatar>
                        <span>
                            {
                                chat.chatRoomType === "PRIVATE" ? (
                                    chat.name ? (
                                        chat.name
                                    ) : (
                                        chat.usersInChat.find((user) => user !== profile?.username)
                                    )
                                ) : (
                                    chat.name ? (
                                        chat.name
                                    ) : (
                                        chat.usersInChat.join(", ")
                                    )
                                )
                            }
                        </span>
                    </button>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))
    );
}