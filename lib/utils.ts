import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SQ_MONTHS = ["jan","shk","mar","pri","maj","qer","kor","gsh","sht","tet","nën","dhj"];

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")} ${SQ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}
