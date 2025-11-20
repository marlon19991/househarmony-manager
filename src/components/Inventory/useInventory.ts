import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
    unit?: string;
    category?: string;
    expiry_date?: string;
    min_quantity?: number;
    notes?: string;
    created_at?: string;
}

export type InventoryItemPayload = Omit<InventoryItem, "id" | "created_at">;

export const useInventory = () => {
    const QUERY_KEY = ["inventory"];

    const {
        createMutation,
        updateMutation,
        deleteMutation,
    } = useSupabaseCrud<InventoryItemPayload, { id: number; data: InventoryItem }, number>({
        table: "inventory_items" as any,
        queryKey: QUERY_KEY,
        mapUpdatePayload: ({ data }) => {
            const { id, created_at, ...rest } = data;
            return rest;
        },
        mapUpdateFilter: ({ id }) => ({ value: id }),
        toastMessages: {
            createSuccess: "Producto agregado al inventario",
            updateSuccess: "Producto actualizado",
            deleteSuccess: "Producto eliminado del inventario",
        },
    });

    const { data: items = [], isLoading } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inventory_items" as any)
                .select("*")
                .order("name");

            if (error) throw error;
            return data as InventoryItem[];
        },
    });

    return {
        items,
        isLoading,
        addItem: createMutation.mutate,
        updateItem: updateMutation.mutate,
        deleteItem: deleteMutation.mutate,
    };
};
