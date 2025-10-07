"use client";
import React, { useRef, useState } from 'react'
import { useLogin, useRegister } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { redirect, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter()
    const [tab, setTab] = useState<'register' | 'login'>('register');
    
    const { mutate, isPending, error, data } = useLogin();

    const { mutate: register, isPending: registerPending, error: registerError } = useRegister()

    const onSuccessRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        return register({ email, password }, { onSuccess: () => setTab('login') })
    }

    const onSuccessLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        return mutate({ email, password }, {
            onSuccess: () => {
                router.push('/')
            }
        })
    }


    return (
        <div className='flex justify-center h-screen bg-[#2a2a2a] items-center flex-col'>
            <Tabs defaultValue='register' className='min-w-xs w-full max-w-xl min-h-48' value={tab}>
                <TabsList>
                    <TabsTrigger onClick={() => setTab('register')} value='register'>Register</TabsTrigger>
                    <TabsTrigger onClick={() => setTab('login')} value='login'>Login</TabsTrigger>
                </TabsList>
                <TabsContent value='register' className='flex flex-col gap-4 space-y-3 max-w-3xl bg-[#1a1a1a] p-4 rounded text-white '>
                    <h2 className='text-2xl font-bold'>Crear tu cuenta</h2>
                    <form onSubmit={onSuccessRegister} className="space-y-3">
                        <Field>
                            <FieldLabel>
                                Email
                            </FieldLabel>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                className="w-full border rounded px-3 py-2"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Contraseña
                            </FieldLabel>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border rounded px-3 py-2"
                            />
                        </Field>
                        {error && (
                            <p className="text-sm text-red-600">
                                {(error as Error).message || "Error de autenticación"}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full rounded bg-black text-white px-4 py-2 disabled:opacity-50"
                        >
                            {isPending ? <Spinner /> : "Crear cuenta"}
                        </Button>
                    </form>
                    <div className="flex justify-center items-center"><p>¿Ya tenés una cuenta?</p> <Button variant="link" onClick={() => setTab('login')} className="text-white">Iniciar sesión</Button></div>
                </TabsContent>
                <TabsContent value='login' className='flex flex-col gap-4 space-y-3 max-w-3xl bg-[#1a1a1a] p-4 rounded text-white '>
                    <h2 className='text-2xl font-bold'>Iniciar sesión</h2>
                    <form onSubmit={onSuccessLogin} className="space-y-3">
                        <Field>
                            <FieldLabel>
                                Email
                            </FieldLabel>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                className="w-full border rounded px-3 py-2"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>
                                Contraseña
                            </FieldLabel>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border rounded px-3 py-2"
                            />
                        </Field>
                        {error && (
                            <p className="text-sm text-red-600">
                                {(error as Error).message || "Error de autenticación"}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full rounded bg-black text-white px-4 py-2 disabled:opacity-50"
                        >
                            {isPending ? "Enviando..." : "Ingresar"}
                        </Button>
                    </form>
                    <div className="flex justify-center gap-2 items-center"><p>¿No tenes una cuenta aún?</p> <Button variant="link" onClick={() => setTab('register')} className="text-white">Registrate</Button></div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Auth
