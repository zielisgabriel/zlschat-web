"use client";

import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z, { set } from "zod";
import { SidebarMenuItem } from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import { CheckIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import { Spinner } from "./ui/shadcn-io/spinner";
import { request } from "http";

const searchFriendOrProfileSchema = z.object({
    username: z.string(),
});

interface SendingRequestFriendshipProps {
    username: string;
    isSent: boolean;
}

type SearchFriendOrProfileType = z.infer<typeof searchFriendOrProfileSchema>;

export function SearchOtherUsersInSidebar() {
    const {profile, clientRef} = useContext(ApplicationContext);
    const [otherUsers, setOtherUsers] = useState<User[] | null>([]);
    const [isLoadingOtherUsers, setIsLoadingOtherUsers] = useState<boolean>(false);
    const [sendingRequestFriendship, setSendingRequestFriendship] = useState<SendingRequestFriendshipProps[]>([]);
    const form = useForm<SearchFriendOrProfileType>({
        resolver: zodResolver(searchFriendOrProfileSchema),
        defaultValues: {
            username: ""
        }
    });

    const searchChatsOrProfileWatch = form.watch("username");

    async function onFetchOtherUsers(username: string) {
        try {
            setIsLoadingOtherUsers(true);
            const response = await api.get(`/api/user/find/${username}`);
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            setOtherUsers(response.data);
            setIsLoadingOtherUsers(false);
        } catch (error: any) {
            setIsLoadingOtherUsers(false);
            toast.error(error.message);
        }
    }

    async function onRequestFriendship(receiverUsername: string) {
        if (!profile || !clientRef.current) return;
        setSendingRequestFriendship(prev => [...(prev || []), { username: receiverUsername, isSent: false }]);
        try {
            const response = await api.post(`/api/user/friends/request/${receiverUsername}`);
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            setSendingRequestFriendship(prev => prev?.map(request => request.username === receiverUsername ? { username: receiverUsername, isSent: true } : request) || null);
            toast.success("Solicitação de amizade enviada!");
        } catch (error: any) {
            setSendingRequestFriendship(prev => prev?.map(request => request.username === receiverUsername ? { username: receiverUsername, isSent: false } : request) || null);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        setIsLoadingOtherUsers(true);
        if (searchChatsOrProfileWatch.length > 0) {
            const timeout = setTimeout(async () => {
                await onFetchOtherUsers(searchChatsOrProfileWatch);
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [searchChatsOrProfileWatch]);

    return (
        <>
            <Form {...form}>
                <form>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => {
                            return (
                                <FormItem className="mb-2">
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Buscar usuário..."
                                            autoComplete="off"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )
                        }}
                    />
                </form>
            </Form>

            {
                searchChatsOrProfileWatch && (
                    isLoadingOtherUsers ? (
                        <div className="flex items-center justify-center">
                            <Spinner className="w-4 h-4" />
                        </div>
                    ) : (
                        otherUsers && otherUsers.length > 0 ? (
                            otherUsers.map((otherUser, index) => (
                                otherUser.username !== profile?.username && (
                                    <SidebarMenuItem key={index}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 items-center px-2">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {otherUser.username.toUpperCase().charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span>
                                                    {otherUser.username}
                                                </span>
                                            </div>

                                            {
                                                profile?.friends.includes(otherUser.username) ? (
                                                    <Button
                                                        className="w-7 h-7 rounded-full cursor-pointer"
                                                        variant={"outline"}
                                                    >
                                                        <CheckIcon className="w-4 h-4" />
                                                    </Button>
                                                ) : (
                                                    sendingRequestFriendship.find(request => request.username === otherUser.username) ? (
                                                        sendingRequestFriendship.map((request, index) => (
                                                            request.isSent ? (
                                                                <Button
                                                                    className="w-7 h-7 rounded-full cursor-pointer"
                                                                    variant={"outline"}
                                                                    key={index}
                                                                >
                                                                    <CheckIcon className="w-4 h-4" />
                                                                </Button>
                                                            ) : (
                                                                <Spinner
                                                                    key={index}
                                                                    className="w-4 h-4"
                                                                />
                                                            )
                                                        ))
                                                    ) : (
                                                        <Button
                                                            className="w-7 h-7 rounded-full cursor-pointer"
                                                            asChild
                                                        >
                                                            <button
                                                                onClick={async () => {
                                                                    await onRequestFriendship(otherUser.username)
                                                                }}
                                                            >
                                                                <PlusIcon className="w-4 h-4" />
                                                            </button>
                                                        </Button>
                                                    )
                                                )
                                            }
                                        </div>
                                    </SidebarMenuItem>
                                )
                            ))
                        ) : (
                            <div className="flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">Nenhum usuário encontrado</span>
                            </div>
                        )
                    )
                )
            }
        </>
    );
}