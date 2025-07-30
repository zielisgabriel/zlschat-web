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

const registerFormSchema = z.object({
    username: z.string().min(3, "O username deve ter no mínimo 3 caracteres"),
    email: z.email("Insira um email válido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormType = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
    const router = useRouter();
    const form = useForm<RegisterFormType>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        }
    });

    async function onLoginSubmit({ username, email, password }: RegisterFormType) {
        try {
            const registerResponse = await api.post("/api/user/register", { username, email, password });
            if (registerResponse.status !== 201) {
                throw new Error("Já existe um usuário com esse email/username");
            }
            await api.post("/api/user/login", { email, password });
            toast.success("Cadastro realizado com sucesso!");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onLoginSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({field}) => {
                            return (
                                <FormItem>
                                    <FormLabel>
                                        <p>
                                            Username
                                        </p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            autoComplete="off"
                                            type="text"
                                            placeholder="Insira seu username"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />

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
                                        <Input
                                            autoComplete="off"
                                            type="email"
                                            placeholder="Insira seu email"
                                            {...field}
                                        />
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
                                        <Input
                                            autoComplete="off"
                                            type="password"
                                            placeholder="Insira sua senha"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                </div>
                <Button type="submit" className="cursor-pointer">
                    Cadastrar
                </Button>
            </form>
        </Form>
    );
}