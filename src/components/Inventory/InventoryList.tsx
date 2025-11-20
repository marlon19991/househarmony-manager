import { InventoryItem } from "./useInventory";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, AlertTriangle, Calendar, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InventoryListProps {
    items: InventoryItem[];
    onDelete: (id: number) => void;
    onUpdate: (data: { id: number; data: any }) => void;
    onEdit: (item: InventoryItem) => void;
}

export const InventoryList = ({ items, onDelete, onUpdate, onEdit }: InventoryListProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
                const isLowStock = item.quantity <= (item.min_quantity || 0);
                const isExpiring = item.expiry_date &&
                    Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 7;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "glass-card p-4 rounded-xl relative group transition-all duration-300 hover:-translate-y-1",
                            isLowStock && "border-amber-500/30 bg-amber-500/5",
                            isExpiring && "border-red-500/30 bg-red-500/5"
                        )}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-foreground truncate pr-8">{item.name}</h3>
                                <p className="text-xs text-muted-foreground">{item.category || "Sin categoría"}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => onEdit(item)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="glass-panel">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-foreground">¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Esto eliminará permanentemente el producto "{item.name}" de tu inventario.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-background/50 border-border/50 text-foreground hover:bg-background/80">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => onDelete(item.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Quantity Control */}
                            <div className="flex items-center justify-between bg-background/50 rounded-lg p-2 border border-border/50">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full hover:bg-background"
                                    onClick={() => onUpdate({ id: item.id, data: { ...item, quantity: Math.max(0, item.quantity - 1) } })}
                                    disabled={item.quantity <= 0}
                                >
                                    <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-mono font-medium text-foreground">
                                    {item.quantity} {item.unit}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full hover:bg-background"
                                    onClick={() => onUpdate({ id: item.id, data: { ...item, quantity: item.quantity + 1 } })}
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </div>

                            {/* Status Indicators */}
                            <div className="flex flex-wrap gap-2 text-xs">
                                {isLowStock && (
                                    <div className="flex items-center text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Stock Bajo
                                    </div>
                                )}
                                {item.expiry_date && (
                                    <div className={cn(
                                        "flex items-center px-2 py-1 rounded-full",
                                        isExpiring ? "text-red-500 bg-red-500/10" : "text-muted-foreground bg-secondary"
                                    )}>
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {format(new Date(item.expiry_date), "d MMM", { locale: es })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
