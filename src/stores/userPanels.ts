import create from "zustand";
import {
  ageTypes,
  categories,
  CategorySelection,
  defaultAge,
} from "src/stores/model";
import { getTranslation } from "src/utils";

export type ControlElement = {
  [key: string]: any;
};

export type ControlGroup = {
  label: string;
  controls: ControlElement[];
};

export type UserPanel = {
  id: string;
  columnId: string;
  isVisible?: boolean;
  zIndex: number;
  controlGroups: {
    categories: ControlGroup;
    age: ControlGroup;
    hasAd: ControlGroup;
  };
};

type UserPanelsStore = {
  panels: UserPanel[];
  add: (
    panelId: string,
    columnId: string,
    categorySelection: CategorySelection[]
  ) => void;
  bringToFront: (panelId: string) => void;
  setControlValue: (
    columnId: string,
    groupSlug: "categories" | "age" | "hasAd",
    controlkey: string,
    value: number | boolean
  ) => void;
  remove: (id: string) => void;
  setIsVisibleByColumnId: (columnId: string, value: boolean) => void;
  removeByColumnId: (columnId: string) => void;
};

export const useUserPanelStore = create<UserPanelsStore>((set) => ({
  panels: [],

  add: (id, columnId, categorySelection) =>
    set((state) => {
      const newPanel = {
        id,
        isVisible: false,
        zIndex: 900,
        columnId,
        controlGroups: {
          categories: {
            label: getTranslation("categories"),
            controls: categories.map(({ label, bgColor }) => ({
              key: label,
              type: "slider",
              bgColor,
              label,
              value:
                categorySelection.find((cat) => cat.label === label)?.value ||
                0,
              minValue: 0,
              maxValue: 10,
            })),
          },
          age: {
            label: getTranslation("topicality"),
            controls: Object.keys(ageTypes).map((key) => ({
              key,
              label: ageTypes[key].label,
              value: key === defaultAge ? true : false,
            })),
          },
          hasAd: {
            label: getTranslation("avoidAds"),
            controls: [
              {
                key: "advertisment",
                label: getTranslation("avoidAds"),
                value: false,
              },
            ],
          },
        },
      };

      return {
        panels: [...state.panels, newPanel],
      };
    }),

  bringToFront: (panelId) =>
    set((state) => {
      // get z-index from all panels
      const zIndexes = state.panels.map((p) => p.zIndex);
      const highestIndex = Math.max(...zIndexes);
      const nextIndex = highestIndex + 1;

      return {
        panels: state.panels.map((panel) => {
          if (panel.id !== panelId) {
            return panel;
          }

          const nextPanel = { ...panel };
          nextPanel.zIndex = nextIndex;

          return nextPanel;
        }),
      };
    }),

  setControlValue: (columnId, groupSlug, controlkey, value) =>
    set((state) => ({
      panels: state.panels.map((panel) => {
        if (panel.columnId !== columnId) {
          return panel;
        }

        const nextPanel = { ...panel };
        const wantedControlElement = nextPanel.controlGroups[
          groupSlug
        ].controls.find((controlEl) => controlEl.key === controlkey);
        if (!wantedControlElement) {
          return panel;
        }

        wantedControlElement.value = value;

        return nextPanel;
      }),
    })),

  remove: (id) =>
    set((state) => ({
      panels: state.panels.filter((panel) => panel.id !== id),
    })),

  setIsVisibleByColumnId: (columnId, value) =>
    set((state) => ({
      panels: state.panels.map((panel) => {
        if (panel.columnId !== columnId) {
          return panel;
        }

        panel.isVisible = value;

        return panel;
      }),
    })),

  removeByColumnId: (columnId) =>
    set((state) => ({
      panels: state.panels.filter((panel) => panel.columnId !== columnId),
    })),
}));
