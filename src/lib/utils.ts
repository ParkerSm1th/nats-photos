import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAdmin(user: UserPublicMetadata) {
  return user && user.role === "ADMIN";
}

export function HOSTNAME() {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://natalielockhartphotos.com";
}
