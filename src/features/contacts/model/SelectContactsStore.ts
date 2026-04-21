import { create } from "zustand";

import { Contact } from "@/entities/contact/model/types";

type SelectContactsStoreState = {
  isSelecting: boolean;
  selected: Contact[];
  isModalOpen: boolean;

  setIsSelecting: (value: boolean) => void;
  toggleIsSelecting: () => void;

  toggleContact: (contact: Contact) => void;
  clearSelected: () => void;

  setIsModalOpen: (value: boolean) => void;

  reset: () => void;
};

export const useSelectContactsStore = create<SelectContactsStoreState>((set) => ({
  isSelecting: false,
  selected: [],
  isModalOpen: false,

  setIsSelecting: (value) => set({ isSelecting: value }),

  toggleIsSelecting: () =>
    set((state) => ({
      isSelecting: !state.isSelecting,
      selected: [],
    })),

  toggleContact: (contact) =>
    set((state) => {
      const isAlreadySelected = state.selected.some((c) => c.uid === contact.uid);
      if (isAlreadySelected) {
        return { selected: state.selected.filter((c) => c.uid !== contact.uid) };
      }
      return { selected: [...state.selected, contact] };
    }),

  clearSelected: () => set({ selected: [] }),

  setIsModalOpen: (value) => set({ isModalOpen: value }),

  reset: () => set({ isSelecting: false, selected: [] }),
}));
