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
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { CheckIcon } from "lucide-react";

export function ChatBox() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<Typing | null>(null);
  const { profile, chatAndMessagesInChat, clientRef } = useContext(ApplicationContext);

  function upsertMessage(newMessage: Message) {
    setMessages(prev => {
      const index = prev.findIndex(m => (m.id && newMessage.id && m.id === newMessage.id) || (m.tempId && newMessage.tempId && m.tempId === newMessage.tempId));
      if (index === -1) return [...prev, newMessage];
      const copyMessages = [...prev];
      copyMessages[index] = { ...copyMessages[index], ...newMessage };
      return copyMessages;
    });
  }

  function onSendMessage(text: string) {
    try {
      if (!profile || !chatAndMessagesInChat || !clientRef?.current) {
        throw new Error("Erro ao enviar mensagem");
      }

      const tempId = uuid();
      const messageToSend: Message = {
        tempId,
        chatRoomId: chatAndMessagesInChat.chatRoom.id!,
        senderUsername: profile.username,
        receiverUsername: chatAndMessagesInChat.chatRoom.usersInChat.filter(u => u !== profile.username)[0],
        content: text,
        status: "SENDING",
        sendAt: new Date(),
      };

      upsertMessage(messageToSend);

      clientRef.current.publish({
        destination: "/app/send.message",
        body: JSON.stringify(messageToSend),
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  useEffect(() => {
    setMessages(chatAndMessagesInChat?.messages || []);
  }, [chatAndMessagesInChat?.chatRoom.id]);

  useEffect(() => {
    if (!chatAndMessagesInChat || !clientRef?.current || !profile) return;

    const client = clientRef.current;
    const chatRoomId = chatAndMessagesInChat.chatRoom.id!;
    let clearTimer: ReturnType<typeof setTimeout> | null = null;

    const typingSub = client.subscribe(`/topic/typing/${chatRoomId}`, (frame: IMessage) => {
        try {
        const typingPayload: Typing = JSON.parse(frame.body);
        if (typingPayload.username === profile.username) return;
        setTyping(typingPayload);

        if (clearTimer) {
            clearTimeout(clearTimer);
        }

        clearTimer = setTimeout(() => {
            setTyping(prev => {
            if (!prev) return null;
            if (prev.username === typingPayload.username && prev.chatRoomId === typingPayload.chatRoomId) {
                return null;
            }
            return prev;
            });
        }, 2500);
        } catch (err) {
        console.error("Invalid typing payload", err);
        }
    });

    const subMessages = client.subscribe("/user/queue/messages", (frame: IMessage) => {
      const incomingMessage: Message = JSON.parse(frame.body);
      upsertMessage(incomingMessage);
    });

    const subMessageStatus = client.subscribe("/user/queue/message-status", (frame: IMessage) => {
      const statusMsg: Message = JSON.parse(frame.body);
      upsertMessage(statusMsg);
    });

    return () => {
        try { typingSub.unsubscribe(); } catch {
            toast.error("Erro ao limpar inscrição de digitação");
        }
        if (clearTimer) {
            clearTimeout(clearTimer);
        }
        try { subMessages.unsubscribe(); } catch {
            toast.error("Erro ao limpar inscrição de mensagens");
        }
        try { subMessageStatus.unsubscribe(); } catch {
            toast.error("Erro ao limpar inscrição de status de mensagens");
        }
    };
  }, [chatAndMessagesInChat?.chatRoom.id, clientRef]);

  useEffect(() => {
    if (!chatAndMessagesInChat || !profile || !clientRef?.current) return;
    const client = clientRef.current;

    const unread = messages.filter(m =>
      m.senderUsername !== profile.username &&
      m.id &&
      m.status !== "READ"
    );

    if (unread.length === 0) return;

    unread.forEach(m => {
      client.publish({
        destination: "/app/read.message",
        body: JSON.stringify({
          messageIdString: m.id,
          senderUsername: m.senderUsername
        })
      });

      upsertMessage({ ...m, status: "READ" });
    });
  }, [chatAndMessagesInChat?.chatRoom.id, messages, clientRef]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing?.typing]);

  return (
    <section className="grid grid-rows-[90vh_auto] h-screen w-full ">
      <ScrollArea className="w-full h-full overflow-y-auto">
        <div className="relative flex flex-col justify-end min-h-[90vh] px-4 pt-0 pb-4 mt-4">
          {messages.map(message => {
            const isOwnMessage = message.senderUsername === profile?.username;
            return (
              <div key={message.id ?? message.tempId} className={clsx(
                "flex mb-2",
                isOwnMessage ? "justify-end" : "justify-start",
                message.status === "SENDING" && "opacity-50"
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
                    <span className="flex gap-0.5 items-center">
                        {message.sendAt ? dayjs(message.sendAt).format("HH:mm") : ""}
                        {isOwnMessage && (
                            <>
                                {message.status === "SENDING" && <Spinner />}
                                {message.status === "SENT" && <CheckIcon className="w-4 h-4" />}
                                {message.status === "READ" && <CheckIcon className="w-4 h-4 text-blue-500" />}
                            </>
                        )}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
          <div>
            <AnimatePresence mode="wait">
              {typing?.typing && typing.username !== profile?.username && (
                <motion.div
                  initial={{ display: "block", opacity: 0 }}
                  animate={{ display: "block", opacity: 1 }}
                  exit={{ display: "none", opacity: 0 }}
                  className="w-fit bg-slate-800 p-2 rounded-md"
                >
                  <Spinner variant="ellipsis" />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </div>
      </ScrollArea>

      {chatAndMessagesInChat && <SendMessageForm onSend={onSendMessage} />}
    </section>
  );
}
