"use client";

import { Message } from "@/@types/Message";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { SendMessageForm } from "./SendMessageForm";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";

export function ChatBox() {
    const clientRef = useRef<Client | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const { profile, chatAndMessagesInChat } = useContext(ApplicationContext);
    
    function onSendMessage(message: string) {
        if (!clientRef.current) return;

        if (!profile || !chatAndMessagesInChat) {
            toast.error("Erro ao enviar mensagem");
            return;
        };

        const messageToSend: Message = {
            chatRoomId: chatAndMessagesInChat.chatRoom.id!,
            senderUsername: profile.username,
            receiverUsername: chatAndMessagesInChat.chatRoom.usersInChat.filter(user => user !== profile.username)[0],
            content: message,
        }

        setMessages(prevMessages => [...prevMessages, messageToSend]);

        clientRef.current.publish({
            destination: "/app/send.message",
            body: JSON.stringify(messageToSend),
        });
    }

    useEffect(() => {
        setMessages(chatAndMessagesInChat?.messages || []);

        const sockJs = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            brokerURL: undefined,
            webSocketFactory: () => sockJs,
            onConnect: () => {
                console.log("Websocket connected");
                
                client.subscribe("/user/queue/messages", (message: IMessage) => {
                    const chatMessage = JSON.parse(message.body) as Message;
                    setMessages(prevMessages => [...prevMessages, chatMessage]);
                });
            },
            onDisconnect: () => {
                console.log("Websocket disconnected");
            },
        });
        
        client.activate();
        clientRef.current = client;
        
        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [chatAndMessagesInChat]);

    if (!chatAndMessagesInChat) return null;

    return (
        <section className="grid grid-rows-[auto_0.08fr] gap-4 w-full p-4">
            <div className="flex flex-col gap-2 w-full justify-end">
                {
                    messages.map((message, index) => {
                        if (message.senderUsername === profile?.username) {
                        return (
                            <div key={index} className="flex justify-end">
                            <div className="flex flex-col bg-slate-600 p-2 rounded-md">
                                <div>
                                    <p className="text-sm text-foreground/70 font-semibold">
                                        {message.senderUsername}
                                    </p>
                                </div>
                                <div>
                                    <p>{message.content}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-foreground/70">
                                        {dayjs(message.sendAt).format("HH:mm")}
                                    </p>
                                </div>
                            </div>
                            </div>
                        )
                        } else {
                        return (
                            <div key={index} className="flex justify-start">
                                <div className="flex flex-col bg-slate-800 p-2 rounded-md">
                                    <div>
                                        <p className="text-sm text-foreground/70 font-semibold">
                                            {message.senderUsername}
                                        </p>
                                    </div>
                                    <div>
                                        <p>
                                            {message.content}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground/70 text-end">
                                            {dayjs(message.sendAt).format("HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                        }
                    })
                }
            </div>

            <SendMessageForm onSend={onSendMessage} />
        </section>
    );
}