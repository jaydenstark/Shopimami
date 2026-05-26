'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useProducts(initialProducts = []) {
  const [sheetProducts] = useState(initialProducts);
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const products = [...firestoreProducts, ...sheetProducts];

  useEffect(() => {

    // 2. Reference to the 'products' collection in Firestore
    const productsRef = collection(db, 'products');

    // Real-time listener for products
    const unsubscribe = onSnapshot(productsRef, async (snapshot) => {
      if (!snapshot.empty) {
        const loadedProducts = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          source: 'firestore'
        }));
        setFirestoreProducts(loadedProducts);
      } else {
        setFirestoreProducts([]);
      }
      setIsLoaded(true);
    }, (error) => {
      console.error("Error fetching products from Firestore:", error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product) => {
    try {
      const productsRef = collection(db, 'products');
      // Remove any existing id so Firestore generates a new unique one
      // eslint-disable-next-line no-unused-vars
      const { id, ...productData } = product;
      await addDoc(productsRef, productData);
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const docRef = doc(db, 'products', updatedProduct.id.toString());
      await updateDoc(docRef, updatedProduct);
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const docRef = doc(db, 'products', id.toString());
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  return {
    products,
    isLoaded,
    addProduct,
    updateProduct,
    deleteProduct
  };
}
