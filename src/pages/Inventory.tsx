import { InventorySection } from "@/components/Inventory/InventorySection";

const Inventory = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Inventario</h1>
                <p className="text-muted-foreground">
                    Gestiona los productos de tu hogar, despensa y limpieza.
                </p>
            </div>

            <InventorySection />
        </div>
    );
};

export default Inventory;
