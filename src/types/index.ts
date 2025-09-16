export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: string;
  createdAt: Date;
  currency: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Receipt {
  id: string;
  imageUrl: string;
  ocrText?: string;
  extractedData?: {
    total?: number;
    items?: ReceiptItem[];
    tax?: number;
    tip?: number;
  };
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
}

export type SplitMethod = 'equal' | 'percentage' | 'custom' | 'item-specific';

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
  items?: string[];
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  groupId: string;
  paidBy: string;
  splitMethod: SplitMethod;
  splits: ExpenseSplit[];
  tax?: number;
  tip?: number;
  receipt?: Receipt;
  items?: ExpenseItem[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
}

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  maxOccurrences?: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface GroupBalance {
  userId: string;
  balance: number;
  owes: { userId: string; amount: number }[];
  owedBy: { userId: string; amount: number }[];
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'digital_wallet' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
}