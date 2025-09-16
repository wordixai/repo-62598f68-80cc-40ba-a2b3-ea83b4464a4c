import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Group, Expense, User, Settlement, ExpenseCategory } from '@/types';

interface AppState {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Groups
  groups: Group[];
  addGroup: (group: Group) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Settlements
  settlements: Settlement[];
  addSettlement: (settlement: Settlement) => void;
  updateSettlement: (id: string, settlement: Partial<Settlement>) => void;
  
  // Categories
  categories: ExpenseCategory[];
  addCategory: (category: ExpenseCategory) => void;
  
  // UI State
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
}

const defaultCategories: ExpenseCategory[] = [
  { id: '1', name: 'Food & Dining', color: 'orange', icon: 'utensils' },
  { id: '2', name: 'Transportation', color: 'blue', icon: 'car' },
  { id: '3', name: 'Entertainment', color: 'purple', icon: 'film' },
  { id: '4', name: 'Shopping', color: 'pink', icon: 'shopping-bag' },
  { id: '5', name: 'Bills & Utilities', color: 'green', icon: 'receipt' },
  { id: '6', name: 'Other', color: 'gray', icon: 'more-horizontal' }
];

const defaultUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      currentUser: defaultUser,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Groups
      groups: [],
      addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
      updateGroup: (id, updates) => set((state) => ({
        groups: state.groups.map(group => 
          group.id === id ? { ...group, ...updates } : group
        )
      })),
      deleteGroup: (id) => set((state) => ({
        groups: state.groups.filter(group => group.id !== id),
        selectedGroupId: state.selectedGroupId === id ? null : state.selectedGroupId
      })),

      // Expenses
      expenses: [],
      addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map(expense => 
          expense.id === id ? { ...expense, ...updates } : expense
        )
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id)
      })),

      // Settlements
      settlements: [],
      addSettlement: (settlement) => set((state) => ({ settlements: [...state.settlements, settlement] })),
      updateSettlement: (id, updates) => set((state) => ({
        settlements: state.settlements.map(settlement => 
          settlement.id === id ? { ...settlement, ...updates } : settlement
        )
      })),

      // Categories
      categories: defaultCategories,
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),

      // UI State
      selectedGroupId: null,
      setSelectedGroupId: (id) => set({ selectedGroupId: id }),
    }),
    {
      name: 'bill-splitting-storage',
    }
  )
);