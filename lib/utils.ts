import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FieldToFormState<Field extends string> = {
  values?: Record<Field, string>;
} & Partial<Record<Field, { errors: string[] }>>;

export function getMidnightRevalidateSeconds() {
  const now = new Date();
  const tomorrowMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  return Math.floor((tomorrowMidnight.getTime() - now.getTime()) / 1000);
}
