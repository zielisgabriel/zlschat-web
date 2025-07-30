"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const loginFormSchema = z.object({
    email: z.email("Insira um email válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormType = z.infer<typeof loginFormSchema>;

export function LoginForm() {
    const router = useRouter();
    const form = useForm<LoginFormType>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    async function onLoginSubmit({ email, password }: LoginFormType) {
        try {
            await api.post("/api/user/login", { email, password });
            toast.success("Login realizado com sucesso!");
            router.push("/");
        } catch (error) {
            toast.error("Email ou senha inválidos!");
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onLoginSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => {
                            return (
                                <FormItem>
                                    <FormLabel>
                                        <p>
                                            Email
                                        </p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Insira seu email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => {
                            return (
                                <FormItem>
                                    <FormLabel>
                                        <p>
                                            Senha
                                        </p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Insira sua senha" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                </div>
                <Button type="submit" className="cursor-pointer">
                    Entrar
                </Button>
            </form>
        </Form>
    );
}