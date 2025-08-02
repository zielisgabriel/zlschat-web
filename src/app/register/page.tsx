import { RegisterForm } from "@/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cadastro | ZlsChat - Chat em tempo real",
    description: "Crie sua conta gratuita no ZlsChat e comece a conversar em tempo real de forma segura e intuitiva. Conecte-se com seus amigos e grupos hoje mesmo.",
    keywords: [
        "chat em tempo real",
        "bate-papo online",
        "cadastro ZlsChat",
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

export default function RegisterPage() {
    return (
        <main className="flex h-screen w-full flex-col gap-4 justify-center items-center">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold text-center">
                    Cadastrar
                </h1>

                <RegisterForm />

                <p className="text-center">
                    Já possui uma conta? <a href="/login" className="text-blue-600 hover:underline">Entrar</a>
                </p>
            </div>
        </main>
    );
}