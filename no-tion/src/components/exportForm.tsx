import { useState } from "react";
import { exportBacklogCSV } from "@/helpers/exportCSV"
import { ColumnData } from "@/lib/task";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const ExportForm = ({ columns }: { columns: ColumnData }) => {
    const [email, setEmail] = useState('')


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await exportBacklogCSV({ email, tasks: Object.values(columns).flat() })
    }
    return (
       <Dialog>
        <DialogTrigger className="self-end bg-black text-white px-4 py-2 rounded hover:cursor-pointer">
            Exportar
        </DialogTrigger>
        <DialogContent className="flex flex-col gap-4">
            <DialogTitle>
                Exportar
            </DialogTitle>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold mb-4">Ingresa los email al que quieras enviar la exportación</h2>
                <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input type="email" className="border border-gray-300 rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Button type="submit" className="w-fit self-end bg-black text-white px-4 py-2 rounded">Exportar</Button>
            </form>
        </DialogContent>
       </Dialog>
    )
}

export default ExportForm