import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates calendar days between notice date and vacate date.
 * Returns a number, or "N/A" if either date is missing.
 */
export function calculateNoticeDays(
  noticeDate: string | null | undefined,
  vacateDate: string | null | undefined
): number | "N/A" {
  if (!noticeDate || !vacateDate) return "N/A"
  const start = new Date(noticeDate)
  const end = new Date(vacateDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calculates days remaining from today (or a specified reference date) until vacate date.
 */
export function getDaysRemaining(
  vacateDateStr?: string | null,
  referenceDate: Date = new Date()
): number | null {
  if (!vacateDateStr) return null
  const vacateDate = new Date(vacateDateStr)
  vacateDate.setHours(0, 0, 0, 0)
  
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = vacateDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

