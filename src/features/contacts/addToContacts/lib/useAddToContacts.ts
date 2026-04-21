"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { addToContacts } from "@/entities/contact/api/addToContacts";
import { useContactStore } from "@/entities/contact/model/store";
import { AddByPhonePayload } from "@/entities/contact/model/types";

export const useAddToContacts = () => {
  const addContactsToStore = useContactStore((s) => s.addContacts);
  const queryClient = useQueryClient();

  const { mutate, ...mutationRest } = useMutation({
    mutationFn: (payload: AddByPhonePayload) => addToContacts(payload),
    onSuccess: (res) => {
      if (res.success) {
        addContactsToStore([res.data]);
        queryClient.invalidateQueries({ queryKey: ["contacts"] });
      }
    },
  });

  const mutateWithCallbacks = useCallback(
    (payload: AddByPhonePayload, onSuccess?: () => void, onError?: () => void) => {
      mutate(payload, {
        onSuccess: (res) => {
          if (res.success) {
            onSuccess?.();
          } else {
            onError?.();
          }
        },
        onError: () => {
          onError?.();
        },
      });
    },
    [mutate],
  );

  return {
    ...mutationRest,
    mutate: mutateWithCallbacks,
  };
};
