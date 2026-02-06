import { createContext, useState, useCallback } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product, quantity = 1000) => {
    setCartItems((prevItems) => {
      // Crear un identificador único que incluya las opciones seleccionadas
      const itemKey = `${product.id}-${product.inkType || 'oneColor'}-${product.paperType || 'paper1'}`;
      const existingItem = prevItems.find((item) => {
        const existingKey = `${item.id}-${item.inkType || 'oneColor'}-${item.paperType || 'paper1'}`;
        return existingKey === itemKey;
      });

      if (existingItem) {
        return prevItems.map((item) => {
          const existingKey = `${item.id}-${item.inkType || 'oneColor'}-${item.paperType || 'paper1'}`;
          return existingKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }

      return [...prevItems, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const updateItemOptions = useCallback((itemIndex, newInkType, newPaperType, newPrice, newPaperLabel) => {
    setCartItems((prevItems) => {
      const newItems = [...prevItems];
      if (newItems[itemIndex]) {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          inkType: newInkType || newItems[itemIndex].inkType,
          paperType: newPaperType || newItems[itemIndex].paperType,
          price: newPrice || newItems[itemIndex].price,
          selectedPaperLabel: newPaperLabel || newItems[itemIndex].selectedPaperLabel
        };
      }
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemOptions,
    clearCart,
    getTotal,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
