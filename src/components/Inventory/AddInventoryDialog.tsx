import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useInventory, InventoryItem } from "./useInventory";

interface AddInventoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: InventoryItem | null;
}

export const AddInventoryDialog = ({ open, onOpenChange, initialData }: AddInventoryDialogProps) => {
    const { addItem, updateItem } = useInventory();
    const [formData, setFormData] = useState({
        name: "",
        quantity: "1",
        unit: "unidades",
        category: "Despensa",
        min_quantity: "1",
        expiry_date: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                quantity: initialData.quantity.toString(),
                unit: initialData.unit || "unidades",
                category: initialData.category || "Despensa",
                min_quantity: (initialData.min_quantity || 0).toString(),
                expiry_date: initialData.expiry_date || "",
            });
        } else {
            setFormData({
                name: "",
                quantity: "1",
                unit: "unidades",
                category: "Despensa",
                min_quantity: "1",
                expiry_date: "",
            });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            quantity: parseInt(formData.quantity),
            unit: formData.unit,
            category: formData.category,
            min_quantity: parseInt(formData.min_quantity),
            expiry_date: formData.expiry_date || undefined,
        };

        const onSuccess = () => {
            onOpenChange(false);
            if (!initialData) {
                setFormData({
                    name: "",
                    quantity: "1",
                    unit: "unidades",
                    category: "Despensa",
                    min_quantity: "1",
                    expiry_date: "",
                });
            }
        };

        if (initialData) {
            updateItem({ id: initialData.id, data: payload }, { onSuccess });
        } else {
            addItem(payload, { onSuccess });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-panel sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {initialData ? "Editar Producto" : "Agregar Producto"}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Modifica los detalles del producto en tu inventario."
                            : "Agrega un nuevo item a tu inventario para llevar el control."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-foreground">Nombre</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-background/50 border-border/50"
                            placeholder="Ej: Leche, Detergente..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="quantity" className="text-foreground">Cantidad</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="bg-background/50 border-border/50"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="unit" className="text-foreground">Unidad</Label>
                            <Select
                                value={formData.unit}
                                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                            >
                                <SelectTrigger className="bg-background/50 border-border/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unidades">Unidades</SelectItem>
                                    <SelectItem value="kg">Kilogramos</SelectItem>
                                    <SelectItem value="g">Gramos</SelectItem>
                                    <SelectItem value="l">Litros</SelectItem>
                                    <SelectItem value="ml">Mililitros</SelectItem>
                                    <SelectItem value="cajas">Cajas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category" className="text-foreground">Categoría</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="bg-background/50 border-border/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Despensa">Despensa</SelectItem>
                                <SelectItem value="Limpieza">Limpieza</SelectItem>
                                <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                                <SelectItem value="Otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="min_quantity" className="text-foreground">Stock Mínimo</Label>
                            <Input
                                id="min_quantity"
                                type="number"
                                min="0"
                                value={formData.min_quantity}
                                onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                                className="bg-background/50 border-border/50"
                                placeholder="Alerta si baja de..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="expiry" className="text-foreground">Vencimiento</Label>
                            <Input
                                id="expiry"
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="bg-background/50 border-border/50"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="glass-button w-full">
                            {initialData ? "Guardar Cambios" : "Guardar Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
