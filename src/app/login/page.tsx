import { LoginForm } from "@/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | ZlsChat - Chat em tempo real",
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
    }
}

export default function LoginPage() {
    return (
        <main className="flex h-screen w-full flex-col gap-4 justify-center items-center">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-center">
                    Entrar
                </h1>

                <LoginForm />

                <p className="text-center">
                    Não possui uma conta? <a href="/register" className="text-blue-600 hover:underline">Cadastre-se</a>
                </p>
            </div>
        </main>
    );
}