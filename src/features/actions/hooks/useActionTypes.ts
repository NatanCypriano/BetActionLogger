import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createActionType,
  deleteActionType,
  fetchActiveActionTypes,
  fetchAllActionTypes,
  setActionTypeActive,
  updateActionType
} from "@/features/actions/api/actionTypesApi";
import { actionQueryKeys } from "@/features/actions/api/queryKeys";
import type { ActionTypeFormValues } from "@/features/actions/schemas/actionTypeSchema";
import type { ActionType } from "@/features/actions/types";

export function useActiveActionTypes() {
  return useQuery<ActionType[]>({
    queryFn: fetchActiveActionTypes,
    queryKey: actionQueryKeys.actionTypes
  });
}

export function useAllActionTypes() {
  return useQuery<ActionType[]>({
    queryFn: fetchAllActionTypes,
    queryKey: actionQueryKeys.allActionTypes
  });
}

export function useCreateActionType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActionType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.allActionTypes });
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.actionTypes });
    }
  });
}

export function useUpdateActionType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ActionTypeFormValues }) =>
      updateActionType(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.allActionTypes });
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.actionTypes });
    }
  });
}

export function useSetActionTypeActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ active, id }: { active: boolean; id: string }) =>
      setActionTypeActive(id, active),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.allActionTypes });
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.actionTypes });
    }
  });
}

export function useDeleteActionType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActionType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.allActionTypes });
      await queryClient.invalidateQueries({ queryKey: actionQueryKeys.actionTypes });
    }
  });
}
