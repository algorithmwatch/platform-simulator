import firstNames from "src/components/Column/first_names.json";
import { sample, omit } from "lodash";
import {
  categories,
  Category,
  CategorySelection,
  createColumnItems,
  orderByDistance,
} from "src/stores/model";
import create from "zustand";

export type ColumnItem = {
  id: number;
  category: Category;
  baseRank: number;
  hasAd: boolean;
  hasPublicSource: boolean;
  age: number;
  isVisible: boolean;
};

export type ColumnItemExported = ColumnItem & {
  category: number;
};

export type Column = {
  id: string;
  name: string;
};

type ColumnsStore = {
  columns: Column[];
  items: { [key: Column["id"]]: ColumnItem[] };
  add: (
    id: string,
    items?: ColumnItemExported[],
    categorySelection?: CategorySelection[]
  ) => void;
  remove: (id: string) => void;
  setItems: (id: string, items: ColumnItem[]) => void;
};

export const useColumnStore = create<ColumnsStore>((set) => ({
  columns: [],
  items: {},

  add: (id, items, categorySelection = []) =>
    set((state) => {
      const newColumn = {
        id,
        name: sample(firstNames) as string,
      };
      const columnItems = items
        ? items.map((item) => ({
            ...item,
            category: categories[item.category],
          }))
        : createColumnItems();
      const columnItemsOrdered = orderByDistance(
        columnItems,
        categorySelection
      );

      return {
        columns: [...state.columns, newColumn],
        items: {
          ...state.items,
          [newColumn.id]: columnItemsOrdered,
        },
      };
    }),

  remove: (id) =>
    set((state) => ({
      columns: state.columns.filter((column) => column.id !== id),
      items: omit(state.items, [id]),
    })),

  setItems: (id, items) =>
    set((state) => ({
      items: { ...state.items, [id]: items },
    })),
}));
