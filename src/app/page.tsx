import { AppSidebar } from "@/components/AppSidebar";
import { ChatBox } from "@/components/ChatBox";
import { FriendRequestDialog } from "@/components/FriendRequestDialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZlsChat - Chat em tempo real",
  description: "Entre na ZlsChat e comece a conversar em tempo real de forma segura e intuitiva. Conecte-se com seus amigos e grupos hoje mesmo.",
  keywords: [
    "chat em tempo real",
    "bate-papo online",
    "login ZlsChat",
    "mensagens seguras",
    "chat seguro",
    "comunicação instantânea",
  ],
  openGraph: {
    siteName: "ZlsChat",
    locale: "pt_BR",
    type: "website",
  },
}

export default function ChatPage() {
  return (
    <SidebarProvider defaultOpen={true} className="relative">
      <AppSidebar />
    
      <div className="absolute top-4 right-4 z-50">
        <FriendRequestDialog />
      </div>

      <ChatBox />
    </SidebarProvider>
  );
}
