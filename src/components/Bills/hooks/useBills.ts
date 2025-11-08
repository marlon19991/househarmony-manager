import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBill,
  deleteBill,
  fetchBills,
  toggleBillStatus,
  updateBill,
  type Bill,
  type BillFormInput,
  type BillStatus,
} from "../utils/billsLogic";
import { useSupabaseCrud } from "@/hooks/useSupabaseCrud";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export const BILLS_QUERY_KEY = ["bills"];

export const useBills = () => {
  const queryClient = useQueryClient();

  const billsQuery = useQuery({
    queryKey: BILLS_QUERY_KEY,
    queryFn: fetchBills,
  });

  const handleRealtimeInvalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY });
  }, [queryClient]);

  const realtimeConfigs = useMemo(
    () => [
      {
        table: "bills",
        callback: handleRealtimeInvalidate,
      },
    ],
    [handleRealtimeInvalidate]
  );

  useRealtimeSubscription("bills_changes", realtimeConfigs);

  const {
    createMutation: createBillMutation,
    updateMutation: updateBillMutation,
    deleteMutation: deleteBillMutation,
  } = useSupabaseCrud<BillFormInput, Bill, number>({
    table: "bills",
    queryKey: BILLS_QUERY_KEY,
    createFn: createBill,
    updateFn: updateBill,
    deleteFn: deleteBill,
    toastMessages: {
      createSuccess: "Factura agregada exitosamente",
      updateSuccess: "Factura actualizada exitosamente",
      deleteSuccess: "Factura eliminada exitosamente",
    },
  });

  const toggleBillStatusMutation = useMutation<
    { newStatus: BillStatus; nextMonthBill: Bill | null },
    Error,
    Bill
  >({
    mutationFn: toggleBillStatus,
    onSuccess: () => {
      void invalidateBills();
    },
  });

  return {
    billsQuery,
    createBillMutation,
    updateBillMutation,
    deleteBillMutation,
    toggleBillStatusMutation,
    refetchBills: billsQuery.refetch,
  };
};
