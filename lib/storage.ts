import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from './types';

export const STORAGE_KEYS = {
  TRANSACTIONS: 'pocketwise_transactions',
  CATEGORIES: 'pocketwise_categories',
} as const;

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Salary'] as const;

async function readArray<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallback;
    }

    return parsed as T[];
  } catch (error) {
    console.error(`Failed to read storage key: ${key}`, error);
    return fallback;
  }
}

async function writeArray<T>(key: string, value: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write storage key: ${key}`, error);
    throw error;
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  return readArray<Transaction>(STORAGE_KEYS.TRANSACTIONS, []);
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  const transactions = await getTransactions();
  transactions.unshift(transaction);
  await writeArray(STORAGE_KEYS.TRANSACTIONS, transactions);
}

export async function deleteTransaction(id: string): Promise<void> {
  const transactions = await getTransactions();
  const next = transactions.filter((transaction) => transaction.id !== id);
  await writeArray(STORAGE_KEYS.TRANSACTIONS, next);
}

export async function getCategories(): Promise<string[]> {
  const categories = await readArray<string>(STORAGE_KEYS.CATEGORIES, [...DEFAULT_CATEGORIES]);

  const unique = new Set<string>([...DEFAULT_CATEGORIES, ...categories]);
  return [...unique];
}

export async function saveCategory(category: string): Promise<void> {
  const formatted = category.trim();
  if (!formatted) {
    return;
  }

  const categories = await getCategories();
  if (categories.some((item) => item.toLowerCase() === formatted.toLowerCase())) {
    return;
  }

  await writeArray(STORAGE_KEYS.CATEGORIES, [...categories, formatted]);
}

export async function deleteCategory(category: string): Promise<void> {
  if (DEFAULT_CATEGORIES.includes(category as (typeof DEFAULT_CATEGORIES)[number])) {
    return;
  }

  const categories = await getCategories();
  const next = categories.filter((item) => item !== category);
  await writeArray(STORAGE_KEYS.CATEGORIES, next);
}

export function getDefaultCategories(): readonly string[] {
  return DEFAULT_CATEGORIES;
}
