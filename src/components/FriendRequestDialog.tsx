"use client";

import { CheckIcon, RotateCwIcon, UsersIcon, XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { useContext, useEffect, useState } from "react";
import { ApplicationContext } from "@/contexts/ApplicationContext";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/shadcn-io/spinner";

export function FriendRequestDialog() {
    const { profile, onLoadProfileAuthenticated } = useContext(ApplicationContext);
    const [requestFriends, setRequestFriends] = useState<string[]>([]);
    const [isLoadingRequestFriends, setIsLoadingRequestFriends] = useState<boolean>(false);

    async function onAcceptFriendship(username: string) {
        try {
            const response = await api.post(`/api/user/friends/accept/${username}`);
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            setRequestFriends(requestFriends.filter(friend => friend !== username));
            toast.success("Amizade aceita!");
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function onRejectFriendship(username: string) {
        try {
            const response = await api.post(`/api/user/friends/reject/${username}`);
            if (response.status !== 200) {
                throw new Error(response.data.message);
            }
            setRequestFriends(requestFriends.filter(friend => friend !== username));
            toast.success("Amizade recusada!");
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    async function onLoadRequestFriends() {
        if (!profile) return null;
        setIsLoadingRequestFriends(true);
        try {
            await onLoadProfileAuthenticated();
            setRequestFriends(profile.friendRequests);
            setIsLoadingRequestFriends(false);
        } catch (error: any) {
            setIsLoadingRequestFriends(false);
            toast.error(error.message);
        }
    }

    return (
        <Dialog>
          <DialogTrigger asChild className="cursor-pointer">
            <Button className="relative">
              <UsersIcon className="w-2 h-2" />
              {
                requestFriends.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500 absolute -right-1 -top-1" />
                )
              }
            </Button>
          </DialogTrigger>

          <DialogContent className="pt-12">
            <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                    Solicitação de amizade
                    <Button
                        className="cursor-pointer"
                        onClick={onLoadRequestFriends}
                    >
                        {
                            isLoadingRequestFriends ? (
                                <Spinner />
                            ) : (
                                <RotateCwIcon className="w-4 h-4" />
                            )
                        }
                    </Button>
                </DialogTitle>
            </DialogHeader>

            <Separator />

            <ScrollArea className="flex flex-col gap-2 mt-4 h-100">
                {
                    profile && requestFriends.length > 0 ? (
                        profile.friendRequests.map((friendRequest, index) => {
                            return (
                                <div key={index} className="flex">
                                    <div className="flex w-full justify-between items-center gap-2 bg-black/50 p-2 max-h-15 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {friendRequest[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <span>{friendRequest}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button className="bg-green-500 hover:bg-green-600 cursor-pointer w-8 h-8" onClick={() => onAcceptFriendship(friendRequest)}>
                                                <CheckIcon className="w-2 h-2 text-white" />
                                            </Button>

                                            <Button className="bg-red-500 hover:bg-red-600 cursor-pointer w-8 h-8" onClick={() => onRejectFriendship(friendRequest)}>
                                                <XIcon className="w-2 h-2 text-white" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        isLoadingRequestFriends ? (
                            <div className="flex justify-center">
                                <Spinner />
                            </div>
                        ) : (
                            <span className="text-muted-foreground text-center">
                                Você não tem solicitações de amizade
                            </span>
                        )
                    )
                }
            </ScrollArea>
          </DialogContent>
        </Dialog>
    );
}