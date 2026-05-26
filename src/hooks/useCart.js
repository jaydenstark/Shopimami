'use client';
import { useState, useEffect } from 'react';

export function useCart() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nbt_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setCartItems(parsed);
        }, 0);
      } catch (e) {
        console.error("Failed to parse cart items:", e);
      }
    }
  }, []);

  const addToCart = (product, selectedSize) => {
    const newItem = {
      id: `${product.id}_${selectedSize.size}_${Date.now()}`,
      productId: product.id,
      name: product.name,
      size: selectedSize.size,
      price: selectedSize.price,
      brand: product.brand,
      image: product.image
    };
    const updated = [...cartItems, newItem];
    setCartItems(updated);
    localStorage.setItem('nbt_cart', JSON.stringify(updated));
    
    // Set toast message to trigger visual non-intrusive alert
    setToastMessage(`${product.name} (${selectedSize.size})`);
  };

  const removeFromCart = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem('nbt_cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('nbt_cart');
  };

  return {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    clearCart,
    toastMessage,
    setToastMessage
  };
}
