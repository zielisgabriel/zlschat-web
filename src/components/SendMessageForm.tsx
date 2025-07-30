"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useContext } from "react";
import { ApplicationContext } from "@/contexts/ApplicationContext";

const sendMessageFormSchema = z.object({
    message: z.string().min(1),
});

type SendMessageFormType = z.infer<typeof sendMessageFormSchema>;

interface SendMessageFormProps {
    onSend: (text: string) => void;
}

export function SendMessageForm({ onSend }: SendMessageFormProps) {
    const { profile, chatAndMessagesInChat } = useContext(ApplicationContext);
    const form = useForm<SendMessageFormType>({
        resolver: zodResolver(sendMessageFormSchema),
        defaultValues: {
            message: "",
        }
    });

    async function onSubmitMessage({ message }: SendMessageFormType) {
        if (!chatAndMessagesInChat || !profile) return;
        onSend(message);
        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitMessage)} className="flex gap-2 w-full">
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input
                                    autoComplete="off"
                                    placeholder="Insira sua mensagem"
                                    {...field}
                                    className="h-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="h-full w-32 cursor-pointer">
                    Enviar
                </Button>
            </form>
        </Form>
    );
}
