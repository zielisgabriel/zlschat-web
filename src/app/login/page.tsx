import { LoginForm } from "@/components/LoginForm";

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