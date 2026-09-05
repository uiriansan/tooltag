import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

export const is_ferramenta = (cod_str: string): boolean => {
  return /^[A-Z][0-9]{3}$/.test(cod_str.trim());
};

export const is_insumo = (cod_str: string): boolean => {
  return /^[0-9]{6}$/.test(cod_str.trim());
};

export const compare_arrays_equals = (arr_a: any[], arr_b: any[]): boolean => {
  if (arr_a.length !== arr_b.length) return false;

  const counts = new Map();

  for (const item of arr_a) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  for (const item of arr_b) {
    if (!counts.has(item)) return false;

    const new_counts = counts.get(item) - 1;
    if (new_counts === 0) counts.delete(item);
    else counts.set(item, new_counts);
  }

  return counts.size === 0;
};
