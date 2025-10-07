import { ColumnData } from "@/app/entities/task/types";
import { exportBacklogCSV } from "@/shared/exportCSV";
import { EMAIL_REGEX } from "@/shared/utils";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Field, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { useState } from "react";
import { toast } from "sonner";



const ExportForm = ({ columns }: { columns: ColumnData }) => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = email.trim();

        if (!EMAIL_REGEX.test(value)) {
            toast.error("Por favor ingresa un email válido.");
            return;
        }

        try {
            setIsSubmitting(true);
            await exportBacklogCSV({ email: value, tasks: Object.values(columns).flat() });
            toast.success("Exportación exitosa");
        } catch (err) {
            toast.error("No se pudo completar la exportación");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger className="self-end bg-black text-white px-4 py-2 rounded hover:cursor-pointer">
                Exportar
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-4">
                <DialogTitle>Exportar</DialogTitle>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold mb-4">
                        Ingresa el email al que quieras enviar la exportación
                    </h2>
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 rounded p-2"
                            pattern={EMAIL_REGEX.source}
                        />
                    </Field>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-fit self-end bg-black text-white px-4 py-2 rounded"
                    >
                        {isSubmitting ? "Exportando..." : "Exportar"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ExportForm;
