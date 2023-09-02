import { type SessionUser } from "@/common/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAdmin(user: SessionUser) {
  return user.role === "ADMIN";
}
