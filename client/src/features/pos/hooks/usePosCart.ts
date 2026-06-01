import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { PosProduct, CartItem } from '../types/pos.types';

export const usePosCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Add item to cart with strict stock validation
  const addItem = useCallback((product: PosProduct, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.variantId === product.variantId);
      const currentQty = existingItem ? existingItem.quantity : 0;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        toast.error(`Stock insuficiente. Solo quedan ${product.stock} unidades de "${product.name}"`);
        return prevItems;
      }

      if (existingItem) {
        toast.success(`Cantidad actualizada para "${product.name}" (+${quantity})`);
        return prevItems.map((item) =>
          item.variantId === product.variantId ? { ...item, quantity: newQty } : item
        );
      }

      toast.success(`"${product.name}" agregado al carrito`);
      return [
        ...prevItems,
        {
          variantId: product.variantId,
          productId: product.productId,
          sku: product.sku,
          name: product.name,
          price: product.price,
          quantity,
          stock: product.stock,
          attributes: product.attributes,
        },
      ];
    });
  }, []);

  // Update item quantity directly
  const updateQty = useCallback((variantId: number, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prevItems) => prevItems.filter((item) => item.variantId !== variantId));
      toast.success('Producto eliminado del carrito');
      return;
    }

    setCartItems((prevItems) => {
      const targetItem = prevItems.find((item) => item.variantId === variantId);
      if (!targetItem) return prevItems;

      if (newQty > targetItem.stock) {
        toast.error(`Stock insuficiente. Solo quedan ${targetItem.stock} unidades en almacén`);
        return prevItems;
      }

      return prevItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity: newQty } : item
      );
    });
  }, []);

  // Remove item completely from cart
  const removeItem = useCallback((variantId: number) => {
    setCartItems((prevItems) => {
      const target = prevItems.find((item) => item.variantId === variantId);
      if (target) {
        toast.success(`"${target.name}" eliminado del carrito`);
      }
      return prevItems.filter((item) => item.variantId !== variantId);
    });
  }, []);

  // Clear all items in cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success('Carrito de ventas vaciado');
  }, []);

  // Calculated totals
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Standard Peruvian IGV (18%) already included in the final sales price or added
    // Here we compute the taxes (IGV is 18% included, so tax = subtotal * 18/118)
    // Or we compute it as subtotal + 18% tax depending on backend preferences. 
    // We will calculate a clean subtotal (price before tax) and tax.
    const taxRate = 0.18;
    const total = subtotal;
    const cleanSubtotal = total / (1 + taxRate);
    const tax = total - cleanSubtotal;

    return {
      subtotal: parseFloat(cleanSubtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    };
  }, [cartItems]);

  return {
    cartItems,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    totals,
  };
};
