"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Button } from "./ui/button";
import React, { useContext, useEffect, useRef } from "react";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import { Textarea } from "./ui/textarea";
import { SendHorizonalIcon } from "lucide-react";
import { useDebounceValue } from "@/hooks/useDebounceValue";

const sendMessageFormSchema = z.object({
    message: z.string().min(1),
});

type SendMessageFormType = z.infer<typeof sendMessageFormSchema>;

interface SendMessageFormProps {
    onSend: (text: string) => void;
}

export function SendMessageForm({ onSend }: SendMessageFormProps) {
    const { profile, chatAndMessagesInChat, clientRef } = useContext(ApplicationContext);
    const form = useForm<SendMessageFormType>({
        resolver: zodResolver(sendMessageFormSchema),
        defaultValues: {
            message: "",
        },
    });
    const debouncedMessage = useDebounceValue(form.watch("message"), 200);
    const lastStateTyping = useRef<boolean>(false);

    async function onSubmitMessage({ message }: SendMessageFormType) {
        if (!chatAndMessagesInChat || !profile) return;
        onSend(message);
        form.reset();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(onSubmitMessage)();
        }
    }

    useEffect(() => {
        if (!chatAndMessagesInChat || !profile || !clientRef.current) return;
        const isTyping = debouncedMessage.trim().length > 0;
        
        if (lastStateTyping.current === isTyping) return;
        lastStateTyping.current = isTyping;

        clientRef.current.publish({
            destination: "/app/typing",
            body: JSON.stringify({
                typing: isTyping,
                chatRoomId: chatAndMessagesInChat.chatRoom.id!,
                username: profile.username,
            }),
        })
    }, [debouncedMessage]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitMessage)} className="flex gap-2 w-full p-4 pt-0">
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Textarea
                                    autoFocus
                                    autoComplete="off"
                                    placeholder="Digite sua mensagem..."
                                    {...field}
                                    onKeyDown={handleKeyDown}
                                    className="h-full w-full resize-none outline-none border-none bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="h-full cursor-pointer">
                    Enviar
                    <SendHorizonalIcon className="w-6 h-6" />
                </Button>
            </form>
        </Form>
    );
}
