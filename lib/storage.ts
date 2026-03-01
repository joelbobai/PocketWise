import AsyncStorage from '@react-native-async-storage/async-storage';

import { Transaction } from './types';

const TRANSACTIONS_KEY = 'pocketwise_transactions';
const CATEGORIES_KEY = 'pocketwise_categories';

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Salary'];

const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  const transactions = parseJSON<Transaction[]>(stored, []);

  return transactions.sort((a, b) => +new Date(b.date) - +new Date(a.date));
};

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  const transactions = await getTransactions();
  const nextTransactions = [transaction, ...transactions];
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(nextTransactions));
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const transactions = await getTransactions();
  const nextTransactions = transactions.filter((transaction) => transaction.id !== id);
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(nextTransactions));
};

export const getCategories = async (): Promise<string[]> => {
  const stored = await AsyncStorage.getItem(CATEGORIES_KEY);
  const categories = parseJSON<string[]>(stored, DEFAULT_CATEGORIES);

  if (!stored) {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  }

  return [...new Set(categories.map((item) => item.trim()).filter(Boolean))];
};

export const saveCategory = async (category: string): Promise<void> => {
  const normalized = category.trim();
  if (!normalized) return;

  const categories = await getCategories();
  if (categories.some((item) => item.toLowerCase() === normalized.toLowerCase())) return;

  const nextCategories = [...categories, normalized];
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(nextCategories));
};

export const toCsv = (transactions: Transaction[]): string => {
  const header = 'id,amount,description,category,type,date';
  const rows = transactions.map((transaction) => {
    const values = [
      transaction.id,
      transaction.amount.toFixed(2),
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.date,
    ];

    return values
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(',');
  });

  return [header, ...rows].join('\n');
};
