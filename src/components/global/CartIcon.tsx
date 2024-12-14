import { faCartShopping } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const CartIcon = ({ size }: { size: number }) => {
  return (
    <div className="relative">
      <FontAwesomeIcon icon={faCartShopping} className="h-5 w-5" />
      {size > 0 && (
        <div className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-400 text-xs text-white">
          {size}
        </div>
      )}
    </div>
  );
};
