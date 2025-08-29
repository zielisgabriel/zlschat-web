"use client";

import { ChatRoom } from "@/@types/ChatRoom";
import { Message } from "@/@types/Message";
import { PUBLIC_PATHS } from "@/environments/PUBLIC_PATHS";
import { api } from "@/lib/api";
import { Client } from "@stomp/stompjs";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { toast } from "sonner";

interface ChatOpenType {
    chatRoom: ChatRoom,
    messages: Message[],
}

interface ApplicationContextProps {
    onLoadProfileAuthenticated: () => Promise<void>;
    profile: User | null;
    chatAndMessagesInChat: ChatOpenType | null;
    onLoadChatAndMessagesInChat: (chatRoomId: string) => Promise<void>;
    clientRef: RefObject<Client | null>;
}

export const ApplicationContext = createContext({} as ApplicationContextProps);

export function ApplicationContextProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<User | null>(null);
    const clientRef = useRef<Client | null>(null);
    const [chatAndMessagesInChat, setChatAndMessagesInChat] = useState<ChatOpenType | null>(null);
    const pathname = usePathname();

    async function onLoadProfileAuthenticated() {
        try {
            const response = await api.get("/api/user/me");

            if (response.status !== 200) {
                throw new Error(response.data.message);
            }

            setProfile(response.data);
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function onLoadChatAndMessagesInChat(chatRoomId: string) {
        const responseChatRoom = chatAndMessagesInChat?.chatRoom.id === chatRoomId ? { data: chatAndMessagesInChat.chatRoom } : await api.get(`/api/chat/find/${chatRoomId}`);
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

    useEffect(() => {
        if (!PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
            const client = new Client({
                brokerURL: undefined,
                webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_API_WEBSOCKET_URL!),
                reconnectDelay: 5000,
                onConnect: async () => {
                    if (chatAndMessagesInChat) {
                        await onLoadChatAndMessagesInChat(chatAndMessagesInChat.chatRoom.id!);
                    }
                }
            });

            client.activate();
            clientRef.current = client;

            return () => {
                client.deactivate();
                clientRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        function handlerEscape(e: KeyboardEvent) {
            if (chatAndMessagesInChat && e.key === "Escape") {
                setChatAndMessagesInChat(null);
            }
        }

        window.addEventListener("keydown", handlerEscape);

        return () => {
            window.removeEventListener("keydown", handlerEscape);
        }
    }, [chatAndMessagesInChat]);

    return (
        <ApplicationContext.Provider value={{onLoadProfileAuthenticated, profile, clientRef, chatAndMessagesInChat, onLoadChatAndMessagesInChat}}>
            { children }
        </ApplicationContext.Provider>
    );
}