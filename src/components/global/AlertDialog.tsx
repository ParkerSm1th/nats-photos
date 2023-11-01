/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog as AlertDialogPrimitive,
  AlertDialogTitle,
} from "../ui/ui/alert-dialog";

export const AlertDialog = ({
  open,
  onClose,
  title,
  body,
  confirmText,
  callback,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  confirmText?: string;
  callback: () => Promise<void>;
}) => {
  return (
    <AlertDialogPrimitive
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={callback}>
            {confirmText ? confirmText : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
};
