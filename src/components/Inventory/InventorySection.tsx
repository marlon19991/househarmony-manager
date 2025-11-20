import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { InventoryList } from "./InventoryList";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { useInventory, InventoryItem } from "./useInventory";

export const InventorySection = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [filter, setFilter] = useState<"all" | "low_stock" | "expiring">("all");
    const { items, isLoading, deleteItem, updateItem } = useInventory();

    const filteredItems = items.filter(item => {
        if (filter === "low_stock") return item.quantity <= (item.min_quantity || 0);
        if (filter === "expiring") {
            if (!item.expiry_date) return false;
            const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 7; // Expiring in 7 days
        }
        return true;
    });

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingItem(null);
    };

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-xl">
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={filter === "all" ? "default" : "ghost"}
                        onClick={() => setFilter("all")}
                        className="flex-1 sm:flex-none"
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filter === "low_stock" ? "default" : "ghost"}
                        onClick={() => setFilter("low_stock")}
                        className="flex-1 sm:flex-none"
                    >
                        Por Agotarse
                    </Button>
                    <Button
                        variant={filter === "expiring" ? "default" : "ghost"}
                        onClick={() => setFilter("expiring")}
                        className="flex-1 sm:flex-none"
                    >
                        Por Vencer
                    </Button>
                </div>

                <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto glass-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Producto
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-xl">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No hay productos</h3>
                    <p className="text-muted-foreground mb-4">
                        {filter === "all"
                            ? "Comienza agregando productos a tu inventario."
                            : "No hay productos que coincidan con el filtro."}
                    </p>
                    {filter === "all" && (
                        <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                            Agregar primer producto
                        </Button>
                    )}
                </div>
            ) : (
                <InventoryList
                    items={filteredItems}
                    onDelete={deleteItem}
                    onUpdate={updateItem}
                    onEdit={handleEdit}
                />
            )}

            <AddInventoryDialog
                open={isDialogOpen}
                onOpenChange={handleOpenChange}
                initialData={editingItem}
            />
        </div>
    );
};
