import { Poppins } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "sonner";
import { ApplicationContextProvider } from "@/contexts/ApplicationContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${poppins.className} antialiased w-full h-screen`}
      >
        <ApplicationContextProvider>
          <Toaster position="top-center" />
          <main className="w-full min-h-screen">
            {children}
          </main>
        </ApplicationContextProvider>
      </body>
    </html>
  );
}
