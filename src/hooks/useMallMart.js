'use client';

import { useState, useEffect } from 'react';
import { initialOrders } from '../data/mallData';

export function useMallMart() {
  const [orders, setOrders] = useState([]);
  const [isFirebase, setIsFirebase] = useState(false); // Indicates active Database Sync
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error("Failed to fetch orders from API");
        const data = await res.json();
        if (!isMounted) return;
        setOrders(data);
        setIsFirebase(true);
        setIsLoaded(true);
      } catch (err) {
        if (!isMounted) return;
        console.warn("Postgres API unavailable, falling back to LocalStorage:", err);
        initializeLocalStorage();
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    const initializeLocalStorage = () => {
      if (typeof window === 'undefined') return;
      
      const localOrders = localStorage.getItem('mallmart_orders');
      if (localOrders) {
        try {
          setOrders(JSON.parse(localOrders));
        } catch {
          setOrders(initialOrders);
          localStorage.setItem('mallmart_orders', JSON.stringify(initialOrders));
        }
      } else {
        setOrders(initialOrders);
        localStorage.setItem('mallmart_orders', JSON.stringify(initialOrders));
      }
      setIsFirebase(false);
      setIsLoaded(true);
    };

    fetchOrders();

    // Start 3-second short polling if database connection is functional
    intervalId = setInterval(fetchOrders, 3000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Helper to save order state (handles both Postgres API and LocalStorage)
  const updateOrderState = async (updatedOrders, singleUpdatedOrder = null) => {
    setOrders(updatedOrders);
    
    // Save to LocalStorage (as cache/fallback)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mallmart_orders', JSON.stringify(updatedOrders));
    }

    // Save to Postgres if connected
    if (isFirebase && singleUpdatedOrder) {
      try {
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(singleUpdatedOrder)
        });
        if (!res.ok) throw new Error("Failed to update order on API");
      } catch (e) {
        console.error("Error writing to database:", e);
      }
    }
  };

  // 1. Add new order (Checkout)
  const addOrder = async (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Payment Confirmed',
      shopper: '',
      rider: '',
      flagged: false,
      flagNote: '',
      createdAt: new Date().toISOString(),
      ...orderData
    };

    const updated = [...orders, newOrder];

    if (!isFirebase) {
      await updateOrderState(updated, newOrder);
      return newOrder.id;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) throw new Error("Failed to create order on API");
      
      setOrders(updated);
      return newOrder.id;
    } catch (err) {
      console.error("Postgres order insertion failed, falling back to LocalStorage:", err);
      setIsFirebase(false);
      await updateOrderState(updated, newOrder);
      return newOrder.id;
    }
  };

  // 2. Accept order (Shopper)
  const acceptOrder = async (orderId, shopperName) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'Shopper Assigned & Shopping',
          shopper: shopperName
        };
      }
      return o;
    });
    
    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // 3. Toggle items checked (Shopper picking checklist)
  const toggleItemChecked = async (orderId, itemName) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(item => {
          if (item.name === itemName) {
            return { ...item, picked: !item.picked };
          }
          return item;
        });
        return { ...o, items: updatedItems };
      }
      return o;
    });

    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // 4. Pay the store (Shopper MoMo payment confirm)
  const payStore = async (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Paid at Mall' };
      }
      return o;
    });

    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // 5. Hand over order to rider counter
  const handOffToRider = async (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Waiting for Rider' };
      }
      return o;
    });

    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // 6. Accept delivery (Rider)
  const acceptDelivery = async (orderId, riderName) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'Out for Delivery',
          rider: riderName
        };
      }
      return o;
    });

    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // 7. Mark order delivered (Rider)
  const markDelivered = async (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'Delivered' };
      }
      return o;
    });

    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // 8. Flag order (Supervisor)
  const flagOrder = async (orderId, flagNote) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          flagged: true,
          flagNote: flagNote
        };
      }
      return o;
    });

    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // 9. Resolve flag (Supervisor)
  const resolveFlag = async (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          flagged: false,
          flagNote: ''
        };
      }
      return o;
    });

    const single = updated.find(o => o.id === orderId);
    await updateOrderState(updated, single);
  };

  // Reset state to initial seed orders (for demo/testing convenience)
  const resetDemo = async () => {
    if (!isFirebase) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mallmart_orders', JSON.stringify(initialOrders));
      }
      setOrders(initialOrders);
      return;
    }

    try {
      const res = await fetch('/api/orders/reset', {
        method: 'POST'
      });
      if (!res.ok) throw new Error("Failed to reset database via API");
      
      const freshRes = await fetch('/api/orders');
      if (freshRes.ok) {
        const data = await freshRes.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to reset database, reverting to LocalStorage reset:", err);
      setIsFirebase(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mallmart_orders', JSON.stringify(initialOrders));
      }
      setOrders(initialOrders);
    }
  };

  return {
    orders,
    isFirebase,
    isLoaded,
    addOrder,
    acceptOrder,
    toggleItemChecked,
    payStore,
    handOffToRider,
    acceptDelivery,
    markDelivered,
    flagOrder,
    resolveFlag,
    resetDemo
  };
}
