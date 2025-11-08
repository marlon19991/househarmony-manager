import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CrudToastMessages = {
  createSuccess?: string;
  updateSuccess?: string;
  deleteSuccess?: string;
  createError?: string;
  updateError?: string;
  deleteError?: string;
};

type FilterConfig = {
  column?: string;
  value: unknown;
};

type UseSupabaseCrudOptions<TCreate, TUpdate, TDelete> = {
  table: string;
  queryKey: QueryKey;
  idColumn?: string;
  selectSingleOnInsert?: boolean;
  createFn?: (payload: TCreate) => Promise<unknown>;
  updateFn?: (payload: TUpdate) => Promise<unknown>;
  deleteFn?: (payload: TDelete) => Promise<unknown>;
  mapCreatePayload?: (payload: TCreate) => Record<string, unknown>;
  mapUpdatePayload?: (payload: TUpdate) => Record<string, unknown>;
  mapUpdateFilter?: (payload: TUpdate) => FilterConfig;
  mapDeleteFilter?: (payload: TDelete) => FilterConfig;
  toastMessages?: CrudToastMessages;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrió un error inesperado";
};

export const useSupabaseCrud = <
  TCreate extends Record<string, unknown>,
  TUpdate,
  TDelete = number | string
>({
  table,
  queryKey,
  idColumn = "id",
  selectSingleOnInsert = true,
  createFn,
  updateFn,
  deleteFn,
  mapCreatePayload,
  mapUpdatePayload,
  mapUpdateFilter,
  mapDeleteFilter,
  toastMessages,
}: UseSupabaseCrudOptions<TCreate, TUpdate, TDelete>) => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey });

  const resolvedCreateFn =
    createFn ??
    (async (payload: TCreate) => {
      const insertPayload = mapCreatePayload
        ? mapCreatePayload(payload)
        : payload;
      const query = supabase.from(table).insert(insertPayload);
      const { data, error } = selectSingleOnInsert
        ? await query.select().single()
        : await query.select();

      if (error) throw error;
      return data;
    });

  const resolvedUpdateFn =
    updateFn ??
    (async (payload: TUpdate) => {
      const updatePayload = mapUpdatePayload
        ? mapUpdatePayload(payload)
        : (payload as Record<string, unknown>);

      const filter = mapUpdateFilter
        ? mapUpdateFilter(payload)
        : {
            column: idColumn,
            value: (payload as Record<string, unknown>)[idColumn],
          };

      if (filter?.value === undefined) {
        throw new Error("No se encontró el identificador para actualizar el registro");
      }

      const { error } = await supabase
        .from(table)
        .update(updatePayload)
        .eq(filter.column ?? idColumn, filter.value as string | number);

      if (error) throw error;
    });

  const resolvedDeleteFn =
    deleteFn ??
    (async (payload: TDelete) => {
      const filter = mapDeleteFilter
        ? mapDeleteFilter(payload)
        : { column: idColumn, value: payload as unknown as string | number };

      if (filter?.value === undefined) {
        throw new Error("No se encontró el identificador para eliminar el registro");
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq(filter.column ?? idColumn, filter.value as string | number);

      if (error) throw error;
    });

  const createMutation = useMutation({
    mutationFn: resolvedCreateFn,
    onSuccess: () => {
      void invalidate();
      if (toastMessages?.createSuccess) {
        toast.success(toastMessages.createSuccess);
      }
    },
    onError: (error) => {
      toast.error(toastMessages?.createError ?? getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: resolvedUpdateFn,
    onSuccess: () => {
      void invalidate();
      if (toastMessages?.updateSuccess) {
        toast.success(toastMessages.updateSuccess);
      }
    },
    onError: (error) => {
      toast.error(toastMessages?.updateError ?? getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: resolvedDeleteFn,
    onSuccess: () => {
      void invalidate();
      if (toastMessages?.deleteSuccess) {
        toast.success(toastMessages.deleteSuccess);
      }
    },
    onError: (error) => {
      toast.error(toastMessages?.deleteError ?? getErrorMessage(error));
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    invalidate,
  };
};
