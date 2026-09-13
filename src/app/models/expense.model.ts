export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Other';

export interface Expense {
  id: number;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string, e.g. "2026-08-10"
  note?: string;
}
