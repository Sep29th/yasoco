import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FieldToFormState<Field extends string> = {
  values?: Record<Field, string>;
} & Partial<Record<Field, { errors: string[] }>>;
