import { create } from "zustand";

import { Contact } from "@/entities/contact/model/types";

type Step2SelectionStoreState = {
  selected: Contact[];
  toggle: (contact: Contact) => void;
  clear: () => void;
};

export const useStep2SelectionStore = create<Step2SelectionStoreState>((set) => ({
  selected: [],

  toggle: (contact) =>
    set((state) => {
      const isAlreadySelected = state.selected.some((c) => c.uid === contact.uid);
      if (isAlreadySelected) {
        return { selected: state.selected.filter((c) => c.uid !== contact.uid) };
      }
      return { selected: [...state.selected, contact] };
    }),

  clear: () => set({ selected: [] }),
}));
