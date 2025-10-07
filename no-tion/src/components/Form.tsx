import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useStore } from "../store";
import { Spinner } from "./ui/spinner";


const SOCKET_URL = `${process.env.API_BACKEND}/kanban`;


const Form = () => {
    const { task, setTask } = useStore()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!socketRef.current) {
            const s = io(SOCKET_URL, { transports: ["websocket"] });
            socketRef.current = s;

            s.on("connect", () => console.log("WS connected:", s.id));
            s.on("connect_error", (err) =>
                console.warn("WS connect_error:", err.message)
            );
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setTask(task)
        socketRef.current?.emit("createTask", task);
        console.log(task)
        setLoading(false)
        setOpen(false)

    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="w-full bg-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center rounded-md justify-center py-3">
                Agregar tarea <Plus className="ml-2" />
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    Agregar tarea
                </DialogTitle>
                <form onSubmit={submit} className="space-y-4">
                    <Field>
                        <FieldLabel>Titulo</FieldLabel>
                        <Input type="text" placeholder="Titulo" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
                    </Field>
                    <Field>
                        <FieldLabel>Descripcion</FieldLabel>
                        <Input type="text" placeholder="Descripcion" value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} />
                    </Field>
                    <Field>
                        <FieldLabel>Tags</FieldLabel>
                        <Input type="text" placeholder="Tags" value={task.tags} onChange={(e) => setTask({ ...task, tags: e.target.value.split(",") })} />
                    </Field>
                    <Field>
                        <FieldLabel>Estado</FieldLabel>
                        <Select name="columnId" value={task.columnId} onValueChange={(value) => setTask({ ...task, columnId: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Por hacer"> <div className="w-2 h-2 rounded-full bg-gray-600"></div> Por hacer</SelectItem>
                                <SelectItem value="En progreso"> <div className="w-2 h-2 rounded-full bg-yellow-400"></div>En progreso</SelectItem>
                                <SelectItem value="Completado"> <div className="w-2 h-2 rounded-full bg-green-600"></div>Completado</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel>Responsabilidad</FieldLabel>
                        <Input type="text" placeholder="Responsabilidad" value={task.responsability} onChange={(e) => setTask({ ...task, responsability: e.target.value.split(",") })} />
                    </Field>
                    <Button type="submit" className="bg-blue-500 text-white mt-3">Agregar tarea{loading ? <Spinner /> : ""}</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default Form