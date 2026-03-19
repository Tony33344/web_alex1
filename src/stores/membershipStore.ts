import { create } from 'zustand';

interface MembershipState {
  selectedPlan: 'monthly' | 'yearly' | null;
  setSelectedPlan: (plan: 'monthly' | 'yearly') => void;
  clearSelection: () => void;
}

export const useMembershipStore = create<MembershipState>((set) => ({
  selectedPlan: null,
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  clearSelection: () => set({ selectedPlan: null }),
}));
