import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EquipmentInstance, AutomationRule, EquipmentType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { equipmentDefinitions } from '../data/equipment';

interface EquipmentStore {
  equipment: EquipmentInstance[];
  automationRules: AutomationRule[];
  totalEnergyUsed: number;

  // Equipment Management
  addEquipment: (definitionId: string, position?: { x: number; y: number }) => string | null;
  removeEquipment: (id: string) => void;
  toggleEquipment: (id: string) => void;
  setEquipmentActive: (id: string, active: boolean) => void;
  toggleAutoMode: (id: string) => void;
  setTargetValue: (id: string, value: number) => void;
  upgradeEquipment: (id: string) => boolean;

  // Automation Rules
  addAutomationRule: (rule: Omit<AutomationRule, 'id'>) => string;
  removeAutomationRule: (id: string) => void;
  toggleAutomationRule: (id: string) => void;
  updateAutomationRule: (id: string, updates: Partial<AutomationRule>) => void;

  // Energy Tracking
  addEnergyUsage: (kwh: number) => void;
  resetDailyEnergy: () => void;

  // Queries
  getEquipmentByType: (type: EquipmentType) => EquipmentInstance[];
  getActiveEquipment: () => EquipmentInstance[];
  getEnabledRules: () => AutomationRule[];

  // Reset
  resetEquipment: () => void;
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      equipment: [],
      automationRules: [],
      totalEnergyUsed: 0,

      addEquipment: (definitionId, position) => {
        const definition = equipmentDefinitions[definitionId];
        if (!definition) return null;

        const id = uuidv4();
        const newEquipment: EquipmentInstance = {
          id,
          definitionId,
          type: definition.type,
          level: 1,
          efficiency: 80,
          powerConsumption: definition.basePowerConsumption,
          isActive: false,
          autoMode: false,
          position
        };

        set((state) => ({ equipment: [...state.equipment, newEquipment] }));
        return id;
      },

      removeEquipment: (id) => set((state) => ({
        equipment: state.equipment.filter((e) => e.id !== id),
        automationRules: state.automationRules.filter((r) => r.equipmentId !== id)
      })),

      toggleEquipment: (id) => set((state) => ({
        equipment: state.equipment.map((e) =>
          e.id === id ? { ...e, isActive: !e.isActive } : e
        )
      })),

      setEquipmentActive: (id, active) => set((state) => ({
        equipment: state.equipment.map((e) =>
          e.id === id ? { ...e, isActive: active } : e
        )
      })),

      toggleAutoMode: (id) => set((state) => ({
        equipment: state.equipment.map((e) =>
          e.id === id ? { ...e, autoMode: !e.autoMode } : e
        )
      })),

      setTargetValue: (id, value) => set((state) => ({
        equipment: state.equipment.map((e) =>
          e.id === id ? { ...e, targetValue: value } : e
        )
      })),

      upgradeEquipment: (id) => {
        const equipment = get().equipment.find((e) => e.id === id);
        if (!equipment) return false;

        const definition = equipmentDefinitions[equipment.definitionId];
        if (!definition || equipment.level >= definition.maxLevel) return false;

        set((state) => ({
          equipment: state.equipment.map((e) => {
            if (e.id !== id) return e;
            const newLevel = e.level + 1;
            return {
              ...e,
              level: newLevel,
              efficiency: Math.min(100, e.efficiency + 5),
              powerConsumption: definition.basePowerConsumption * (1 - (newLevel - 1) * 0.1)
            };
          })
        }));

        return true;
      },

      addAutomationRule: (rule) => {
        const id = uuidv4();
        const newRule: AutomationRule = { ...rule, id };
        set((state) => ({ automationRules: [...state.automationRules, newRule] }));
        return id;
      },

      removeAutomationRule: (id) => set((state) => ({
        automationRules: state.automationRules.filter((r) => r.id !== id)
      })),

      toggleAutomationRule: (id) => set((state) => ({
        automationRules: state.automationRules.map((r) =>
          r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
        )
      })),

      updateAutomationRule: (id, updates) => set((state) => ({
        automationRules: state.automationRules.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        )
      })),

      addEnergyUsage: (kwh) => set((state) => ({
        totalEnergyUsed: state.totalEnergyUsed + kwh
      })),

      resetDailyEnergy: () => set({ totalEnergyUsed: 0 }),

      getEquipmentByType: (type) =>
        get().equipment.filter((e) => e.type === type),

      getActiveEquipment: () =>
        get().equipment.filter((e) => e.isActive),

      getEnabledRules: () =>
        get().automationRules.filter((r) => r.isEnabled),

      resetEquipment: () => set({
        equipment: [],
        automationRules: [],
        totalEnergyUsed: 0
      })
    }),
    {
      name: 'farmiq-equipment-store',
      partialize: (state) => ({
        equipment: state.equipment,
        automationRules: state.automationRules,
        totalEnergyUsed: state.totalEnergyUsed
      })
    }
  )
);
