"use client";

import { CheckIcon, ChevronDown, LogOutIcon, PlusIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "./ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ChatRoom } from "@/@types/ChatRoom";

const searchFriendOrProfileSchema = z.object({
    username: z.string(),
});

type SearchFriendOrProfileType = z.infer<typeof searchFriendOrProfileSchema>;

export function AppSidebar() {
    const { profile, onLoadChatAndMessagesInChat } = useContext(ApplicationContext);
    const [chats, setChats] = useState<ChatRoom[]>([]);
    const [otherUsers, setOtherUsers] = useState<User[]>([]);
    const router = useRouter();
    const form = useForm<SearchFriendOrProfileType>({
        resolver: zodResolver(searchFriendOrProfileSchema),
        defaultValues: {
            username: ""
        }
    });

    const searchChatsOrProfileWatch = form.watch("username");

    async function onLogout() {
        await api.post("/api/user/logout");
        router.push("/login");
    }

    async function onFetchMyChats() {
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

    async function onFetchOtherUsers(username: string) {
        try {
            const response = await api.get(`/api/user/find/${username}`);
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            setOtherUsers(response.data);
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function onRequestFriendship(username: string) {
        try {
            const response = await api.post(`/api/user/friends/request/${username}`)
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            toast.success("Pedido de amizade enviado com sucesso!");
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        onFetchMyChats();
    }, []);
    
    useEffect(() => {
        if (searchChatsOrProfileWatch.length > 0) {
            const timeout = setTimeout(async () => {
                await onFetchOtherUsers(searchChatsOrProfileWatch);
            }, 1500);

            return () => clearTimeout(timeout);
        }
    }, [searchChatsOrProfileWatch]);

    return (
        <Sidebar collapsible="none" className="h-screen">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Zls Chat
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <Form {...form}>
                            <form>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => {
                                        return (
                                            <FormItem className="mb-2">
                                                <FormControl>
                                                    <Input type="text" placeholder="Procurar" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )
                                    }}
                                />
                            </form>
                        </Form>

                        <SidebarMenu>
                            {searchChatsOrProfileWatch && otherUsers ? (
                                otherUsers.map((otherUser, index) => (
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
                                                    <CheckIcon className="w-4 h-4" />
                                                ) : (
                                                    <Button
                                                        onClick={() => onRequestFriendship(otherUser.username)}
                                                        className="w-7 h-7 rounded-full cursor-pointer"
                                                    >
                                                        <PlusIcon className="w-3 h-3" />
                                                    </Button>
                                                )
                                            }
                                        </div>
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                chats.map((chat, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton asChild>
                                            <button className="cursor-pointer" onClick={async () => await onLoadChatAndMessagesInChat(chat.id!)}>
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
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="cursor-pointer">
                                    <div className="flex gap-2 items-center">
                                        <Avatar>
                                            <AvatarFallback>
                                                {profile?.username.toUpperCase().charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p>
                                            {profile?.username}
                                        </p>
                                    </div>
                                        <ChevronDown className="w-4 h-4 ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" className="w-[--radix-popper-anchor-width]">
                                <DropdownMenuItem>
                                    <button className="cursor-pointer">
                                        <p className="flex items-center gap-1">
                                            Perfil
                                        </p>
                                    </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <button className="cursor-pointer" onClick={onLogout}>
                                        <p className="text-red-400 flex items-center gap-1">
                                            Sair
                                            <span>
                                                <LogOutIcon className="text-red-400" />
                                            </span>
                                        </p>
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}