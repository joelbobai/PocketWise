export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
};
