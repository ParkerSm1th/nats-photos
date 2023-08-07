import { cn } from "@/lib/utils";
import { FC } from "react";
import { Icons } from "./icons";

export const Spinner: FC<{
  className?: string;
}> = ({ className }) => {
  return <Icons.spinner className={cn("h-8 w-8 animate-spin", className)} />;
};

export const FullSpinner: FC<{
  className?: string;
  spinnerClassName?: string;
}> = ({ className, spinnerClassName }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
    >
      <Spinner className={spinnerClassName} />
    </div>
  );
};

export const FullScreenSpinner: FC<{
  className?: string;
  spinnerClassName?: string;
}> = ({ className, spinnerClassName }) => {
  return (
    <div
      className={cn(
        "flex h-screen w-screen items-center justify-center",
        className
      )}
    >
      <Spinner className={spinnerClassName} />
    </div>
  );
};
