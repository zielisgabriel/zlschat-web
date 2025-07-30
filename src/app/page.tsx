import { AppSidebar } from "@/components/AppSidebar";
import { ChatBox } from "@/components/ChatBox";
import { FriendRequestDialog } from "@/components/FriendRequestDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UsersIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZLSChat",
}

export default function ChatPage() {
  return (
    <SidebarProvider defaultOpen={true} className="relative">
      <AppSidebar />
    
      <div className="absolute top-4 right-4">
        <FriendRequestDialog />
      </div>


      <ChatBox />
    </SidebarProvider>
  );
}
