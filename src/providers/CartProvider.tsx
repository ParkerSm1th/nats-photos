import React, {
  createContext,
  type FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { LocalStorageKey } from "../common/constants";

type CartItem = {
  id: string;
  link: string;
  show: {
    id: string;
    name: string;
  };
};

type CartStore = {
  items: CartItem[];
};

type ContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  setCart: (items: CartItem[]) => void;
};

const Context = createContext<ContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  setCart: () => {},
});

export const useCart = () => useContext(Context);

interface Props {
  children: React.ReactNode;
}
export const CartProvider: FC<Props> = ({ children }) => {
  const [cart, setLocalCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  React.useEffect(() => {
    try {
      const lastStore = JSON.parse(
        localStorage.getItem(LocalStorageKey.CART) ?? ""
      ) as CartStore;
      if (!lastStore) {
        setReady(true);
        return;
      }
      setLocalCart(lastStore?.items ?? []);
    } catch (e) {
      setLocalCart([]);
      console.log("Error setting cart:", e);
    }
    setReady(true);
  }, []);

  const addToCart = useCallback(
    (item: CartItem) => {
      if (cart.find((i) => i.id === item.id)) return;
      const newCart = [...cart, item];
      setLocalCart(newCart);
      const newStore = {
        items: newCart,
      };
      localStorage.setItem(LocalStorageKey.CART, JSON.stringify(newStore));
    },
    [cart]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      if (!cart.find((i) => i.id === id)) return;
      const newItems = cart.filter((i) => i.id !== id);
      setLocalCart(newItems);
      const newStore = {
        items: newItems,
      };
      localStorage.setItem(LocalStorageKey.CART, JSON.stringify(newStore));
    },
    [cart]
  );

  const setCart = useCallback((items: CartItem[]) => {
    setLocalCart(items);
    const newStore = {
      items,
    };
    localStorage.setItem(LocalStorageKey.CART, JSON.stringify(newStore));
  }, []);

  const value = useMemo<ContextType>(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      setCart,
    }),
    [cart, addToCart, removeFromCart, setCart]
  );

  return <Context.Provider value={value}>{ready && children}</Context.Provider>;
};
