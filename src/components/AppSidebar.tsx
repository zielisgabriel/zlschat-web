"use client";

import { ChevronDown, LogOutIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useContext } from "react";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ChatListInSidebar } from "./ChatListInSidebar";
import { Separator } from "./ui/separator";
import { SearchOtherUsersInSidebar } from "./SearchOtherUsersInSidebar";

export function AppSidebar() {
    const { profile, onLoadChatAndMessagesInChat } = useContext(ApplicationContext);
    const router = useRouter();

    async function onLogout() {
        await api.post("/api/user/logout");
        router.push("/login");
    }

    return (
        <Sidebar collapsible="none" className="h-screen">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Lista de chats
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SearchOtherUsersInSidebar />
                            <Separator className="my-2" />
                            <ChatListInSidebar
                                onLoadChatRoom={async (chatId) => await onLoadChatAndMessagesInChat(chatId)}
                            />
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