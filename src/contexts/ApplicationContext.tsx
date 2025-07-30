"use client";

import { ChatRoom } from "@/@types/ChatRoom";
import { Message } from "@/@types/Message";
import { PUBLIC_PATHS } from "@/environments/PUBLIC_PATHS";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";

interface ChatOpenType {
    chatRoom: ChatRoom,
    messages: Message[],
}

interface ApplicationContextProps {
    profile: User | null,
    chatAndMessagesInChat: ChatOpenType | null
    onLoadChatAndMessagesInChat: (chatRoomId: string) => Promise<void>
}

export const ApplicationContext = createContext({} as ApplicationContextProps);

export function ApplicationContextProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<User | null>(null);
    const [chatAndMessagesInChat, setChatAndMessagesInChat] = useState<ChatOpenType | null>(null);
    const pathname = usePathname();

    async function onLoadProfileAuthenticated() {
        const response = await api.get("/api/user/me");
        setProfile(response.data);
    }

    async function onLoadChatAndMessagesInChat(chatRoomId: string) {
        const responseChatRoom = await api.get(`/api/chat/find/${chatRoomId}`);
        const responseMessages = await api.get(`/api/messages/${chatRoomId}`);
        setChatAndMessagesInChat({
            chatRoom: responseChatRoom.data,
            messages: responseMessages.data
        });
    }

    useEffect(() => {
        if (!PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
            onLoadProfileAuthenticated();
        }
    }, [pathname]);

    return (
        <ApplicationContext.Provider value={{profile, chatAndMessagesInChat, onLoadChatAndMessagesInChat}}>
            { children }
        </ApplicationContext.Provider>
    );
}