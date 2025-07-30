import { RegisterForm } from "@/components/RegisterForm";

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