"use client";

import { Message } from "@/@types/Message";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { SendMessageForm } from "./SendMessageForm";
import { IMessage } from "@stomp/stompjs";
import { Typing } from "@/@types/Typing";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "./ui/shadcn-io/spinner";
import clsx from "clsx";

export function ChatBox() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [typing, setTyping] = useState<Typing | null>(null);
    const { profile, chatAndMessagesInChat, clientRef } = useContext(ApplicationContext);

    function onSendMessage(message: string) {
        if (!profile || !chatAndMessagesInChat || !clientRef.current) {
            throw new Error("Erro ao enviar mensagem");
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
        if (!chatAndMessagesInChat || !clientRef.current) return;
        const messagesSubscribe = clientRef.current.subscribe("/user/queue/messages", (message: IMessage) => {
            const messageReceived: Message = JSON.parse(message.body);
            setMessages(prevMessages => [...prevMessages, messageReceived]);
        });
        setMessages(chatAndMessagesInChat.messages || []);
        return () => {
            messagesSubscribe.unsubscribe();
        }
    }, [chatAndMessagesInChat]);

    useEffect(() => {
        if (!profile || !chatAndMessagesInChat || !clientRef.current) return;
        const chatRoomId = chatAndMessagesInChat.chatRoom.id!;

        const typingSubscribe = clientRef.current.subscribe(`/topic/typing/${chatRoomId}`, (message: IMessage) => {
            const typingReceived: Typing = JSON.parse(message.body);
            if (typingReceived.chatRoomId === chatRoomId && typingReceived.username !== profile.username) {
                setTyping(typingReceived);
            }
        });

        return () => {
            typingSubscribe?.unsubscribe();
        }
    }, [chatAndMessagesInChat?.chatRoom.id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing?.typing]);

    return (
        <section className="grid grid-rows-[90vh_auto] h-screen w-full ">
            <ScrollArea className="w-full h-full overflow-y-auto">
                <div className="relative flex flex-col justify-end min-h-[90vh] px-4 pt-0 pb-4 mt-4">
                    {
                        messages.map((message, index) => {
                            const isOwnMessage = message.senderUsername === profile?.username;

                            return (
                                <div key={index} className={clsx(
                                    "flex mb-2",
                                    isOwnMessage ? "justify-end" : "justify-start"
                                )}>
                                    <div className={clsx(
                                        "flex flex-col p-2 rounded-md max-w-[80%]",
                                        isOwnMessage ? "bg-slate-600" : "bg-slate-800",
                                    )}>
                                        <p className="text-sm text-white/70 font-semibold">
                                            {message.senderUsername}
                                        </p>
                                        <p className="text-white">
                                            {message.content}
                                        </p>
                                        <p className={clsx(
                                            "text-sm text-white/70",
                                            isOwnMessage && "text-end"
                                        )}>
                                            {dayjs(message.sendAt).format("HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    }

                    <div>
                        <AnimatePresence mode="wait">
                            {
                                typing?.typing && typing.username !== profile?.username && (
                                    <motion.div
                                        initial={{
                                            display: "block",
                                            opacity: 0,
                                        }}
                                        animate={{
                                            display: "block",
                                            opacity: 1,
                                        }}
                                        exit={{
                                            display: "none",
                                            opacity: 0,
                                        }}
                                        className="w-fit bg-slate-800 p-2 rounded-md"
                                    >
                                        <Spinner variant="ellipsis" />
                                    </motion.div>
                                )
                            }

                        </AnimatePresence>

                        <div ref={scrollRef} />
                    </div>
                </div>


            </ScrollArea>

            {
                chatAndMessagesInChat && (
                    <SendMessageForm onSend={onSendMessage} />
                )
            }
        </section>
    );
}