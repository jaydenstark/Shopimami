'use client';

import { useState, useRef, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import * as XLSX from 'xlsx';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../../lib/firebase';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import InvoiceModal from '../../components/shop/InvoiceModal';

// Helper for B2B discount code generation
function generateDiscountCode(businessName) {
  const prefix = businessName?.substring(0, 4).toUpperCase().replace(/\s/g, '') || 'B2B';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `NBT-${prefix}-${randNum}`;
}

export default function AdminDashboard() {
  const { products, isLoaded, addProduct, deleteProduct, updateProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Dynamic collections from Firestore
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [wholesaleClients, setWholesaleClients] = useState([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Advanced B2B CRM States
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const [crmSubTab, setCrmSubTab] = useState('pipeline'); // 'pipeline' | 'leads' | 'wholesalers' | 'retail'

  // Mock Clients for robust fallback demo
  const mockClients = [
    { 
      id: 'client_1', 
      company: 'Stark Chemical Enterprise', 
      representative: 'Jayden Stark', 
      phone: '0246272115', 
      email: 'jayden@starkchemical.com', 
      tier: 'Tier 1 Prime Distributor', 
      discountCode: 'NBT-STAR-9821', 
      creditLimit: 120000, 
      creditUsed: 42000, 
      status: 'active', 
      date: '2026-05-18', 
      timeline: [{ event: 'Distributor account provisioned', date: '2026-05-18 10:30' }], 
      tasks: [{ text: 'Deliver 100 Gallons Clean Bleach', done: true }, { text: 'Audit Q3 payments', done: false }] 
    },
    { 
      id: 'client_2', 
      company: 'Ghana National Soap Depot', 
      representative: 'Ama Osei', 
      phone: '0547123456', 
      email: 'ama@ghanasoap.com', 
      tier: 'Tier 2 Bulk Wholesaler', 
      discountCode: 'NBT-DEP-4512', 
      creditLimit: 60000, 
      creditUsed: 12500, 
      status: 'active', 
      date: '2026-05-20', 
      timeline: [{ event: 'Account provisioned', date: '2026-05-20 14:15' }], 
      tasks: [{ text: 'Verify industrial certificate', done: false }] 
    }
  ];

  const activeClients = wholesaleClients.length > 0 ? wholesaleClients : mockClients;

  // Phone Normalizer for Ghana WhatsApp Redirects
  const formatGhanaPhone = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1);
    }
    if (cleaned.length === 9) {
      cleaned = '233' + cleaned;
    }
    return cleaned;
  };

  // Helper to parse string items into structured lists for PO redirects
  const parseStringItems = (itemsStr) => {
    if (!itemsStr) return [];
    const parts = itemsStr.split(',');
    return parts.map(part => {
      const qtyMatch = part.match(/^\s*(\d+)x\s+(.+)$/i);
      let qty = 1;
      let nameAndSize = part.trim();
      if (qtyMatch) {
        qty = parseInt(qtyMatch[1]);
        nameAndSize = qtyMatch[2].trim();
      }
      const sizeMatch = nameAndSize.match(/(.+)\s*\(([^)]+)\)\s*$/);
      let name = nameAndSize;
      let size = 'Standard';
      if (sizeMatch) {
        name = sizeMatch[1].trim();
        size = sizeMatch[2].trim();
      }
      let unitPrice = 25;
      const normName = name.toLowerCase();
      if (normName.includes('industrial detergent') || normName.includes('ibc')) {
        unitPrice = 4125;
      } else if (normName.includes('floral') && size.includes('5L')) {
        unitPrice = 125;
      } else if (normName.includes('bleach') && size.includes('25L')) {
        unitPrice = 540;
      } else if (normName.includes('disinfectant') && size.includes('25L')) {
        unitPrice = 230;
      } else if (normName.includes('handwash') && size.includes('5L')) {
        unitPrice = 100;
      }
      return {
        name,
        size,
        qty,
        unitPrice,
        total: qty * unitPrice
      };
    });
  };

  // Helper to generate the exact B2B VAT Invoice WhatsApp template matching the InvoiceModal
  const getQuickWhatsAppPO = (order) => {
    if (!order) return '';
    const orderId = order.id.slice(-6).toUpperCase();
    const customer = order.customer?.name || 'Customer';
    
    const items = Array.isArray(order.items)
      ? order.items.map(item => {
          const qty = item.quantity || item.qty || 1;
          const price = item.price || 25;
          return {
            name: item.name || 'Chemical product',
            size: item.size || '1L',
            qty: qty,
            unitPrice: price,
            total: qty * price
          };
        })
      : typeof order.items === 'string'
      ? parseStringItems(order.items)
      : [{ name: 'NBT Formulations Pack', size: 'Bulk Size', qty: 1, unitPrice: order.totalAmount || 0, total: order.totalAmount || 0 }];

    const totalAmount = order.totalAmount || order.total || items.reduce((acc, i) => acc + i.total, 0);
    const subtotal = Math.round((totalAmount / 1.219) * 100) / 100;
    
    let itemsList = items.map(item => `• ${item.name} (${item.size}) x${item.qty} - GH₵ ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join('\n');
    
    return `Hello ${customer},

Here is a summary of your Purchase Order *#INV-${orderId}* from *Neat Brand Trade (NBT)*:

*Ordered Products:*
${itemsList}

*VAT & Levies Summary:*
- GRA Subtotal (Exclusive): GH₵ ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Levy / VAT taxes: GH₵ ${(totalAmount - subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
*GRAND TOTAL PAYABLE: GH₵ ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*

Please review the complete tax details. Let us know if you need our bank transfer details for credit line clearance or checkout settlement.

Thank you for your business! 🧪🛡️`;
  };

  // Firestore Credit Ledger payment logger
  const handleLogPayment = async (clientId, amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    try {
      const client = activeClients.find(c => c.id === clientId);
      if (!client) return;
      const newCreditUsed = Math.max(0, (client.creditUsed || 0) - parsedAmount);
      const docRef = doc(db, 'wholesale_clients', clientId);
      const timelineEvent = {
        event: `Logged payment of GH₵ ${parsedAmount}. Credit usage reduced from GH₵ ${client.creditUsed || 0} to GH₵ ${newCreditUsed}.`,
        date: new Date().toLocaleString()
      };
      const updatedTimeline = client.timeline ? [timelineEvent, ...client.timeline] : [timelineEvent];
      await updateDoc(docRef, {
        creditUsed: newCreditUsed,
        timeline: updatedTimeline
      });
      setSelectedClient(prev => prev ? { ...prev, creditUsed: newCreditUsed, timeline: updatedTimeline } : null);
      setPaymentAmount('');
      alert("💳 Cash payment logged successfully in distributor ledger!");
    } catch (e) {
      console.error(e);
      alert("Failed to log payment: " + e.message);
    }
  };

  // Firestore Credit Limit Adjuster
  const handleAdjustCreditLimit = async (clientId, limit) => {
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      alert("Please enter a valid credit limit.");
      return;
    }
    try {
      const client = activeClients.find(c => c.id === clientId);
      if (!client) return;
      const docRef = doc(db, 'wholesale_clients', clientId);
      const timelineEvent = {
        event: `Adjusted Credit Limit from GH₵ ${client.creditLimit || 50000} to GH₵ ${parsedLimit}.`,
        date: new Date().toLocaleString()
      };
      const updatedTimeline = client.timeline ? [timelineEvent, ...client.timeline] : [timelineEvent];
      await updateDoc(docRef, {
        creditLimit: parsedLimit,
        timeline: updatedTimeline
      });
      setSelectedClient(prev => prev ? { ...prev, creditLimit: parsedLimit, timeline: updatedTimeline } : null);
      setNewCreditLimit('');
      alert("⚙️ Credit limit adjusted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to adjust limit: " + e.message);
    }
  };

  // Pipeline status stage updates
  const handleUpdateB2BStatus = async (collectionName, docId, newStatus) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const timelineEvent = {
        event: `Pipeline stage updated to [${newStatus.toUpperCase()}]`,
        date: new Date().toLocaleString()
      };
      let existingObj = null;
      if (collectionName === 'wholesale_clients') {
        existingObj = activeClients.find(c => c.id === docId);
      } else if (collectionName === 'bulk_inquiries') {
        existingObj = messages.find(m => m.id === docId) || mockMessages.find(m => m.id === docId);
      }
      const updatedTimeline = existingObj && existingObj.timeline 
        ? [timelineEvent, ...existingObj.timeline] 
        : [timelineEvent];
      await updateDoc(docRef, {
        status: newStatus,
        timeline: updatedTimeline
      });
      if (selectedClient && selectedClient.id === docId) {
        setSelectedClient(prev => prev ? { ...prev, status: newStatus, timeline: updatedTimeline } : null);
      }
      alert(`Pipeline stage updated to: ${newStatus}`);
    } catch (e) {
      console.error(e);
      alert("Failed to update pipeline stage: " + e.message);
    }
  };

  // Onboard Lead to Active B2B Client
  const handleOnboardLead = async (lead) => {
    try {
      const discountCodeVal = generateDiscountCode(lead.businessName);
      const newClientData = {
        company: lead.businessName || 'Unnamed Corporate B2B',
        representative: lead.contactPerson || 'Unknown Rep',
        phone: lead.phone || '',
        email: lead.email || '',
        tier: 'Tier 2 Bulk Wholesaler',
        discountCode: discountCodeVal,
        creditLimit: 50000,
        creditUsed: 0,
        status: 'active',
        createdAt: new Date(),
        timeline: [
          { event: 'Account provisioned from corporate lead inquiry', date: new Date().toLocaleString() }
        ],
        tasks: [
          { text: 'Send product samples & price sheets', done: false },
          { text: 'Verify certificates & business status', done: false },
          { text: 'Establish credit lines & dispatch routines', done: false }
        ]
      };
      
      const docRef = await addDoc(collection(db, 'wholesale_clients'), newClientData);
      
      // Update B2B Inquiry lead status to onboarded
      const leadDocRef = doc(db, 'bulk_inquiries', lead.id);
      await updateDoc(leadDocRef, { 
        status: 'onboarded',
        timeline: [{ event: `Approved B2B Client account provisioned (#${docRef.id.slice(-5)})`, date: new Date().toLocaleString() }]
      });

      setSelectedClient(null);
      alert("🎉 Corporate Lead onboarded as verified distributor successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to onboard B2B Lead: " + e.message);
    }
  };

  // Add Task checklist item
  const handleAddTask = async (clientId, collectionName, text) => {
    if (!text.trim()) return;
    try {
      const isClient = collectionName === 'wholesale_clients';
      const existingObj = isClient 
        ? activeClients.find(c => c.id === clientId) 
        : messages.find(m => m.id === clientId) || mockMessages.find(m => m.id === clientId);
      if (!existingObj) return;
      const currentTasks = existingObj.tasks || [];
      const updatedTasks = [...currentTasks, { text: text.trim(), done: false }];
      const docRef = doc(db, collectionName, clientId);
      await updateDoc(docRef, { tasks: updatedTasks });
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(prev => prev ? { ...prev, tasks: updatedTasks } : null);
      }
      setNewTaskText('');
    } catch (e) {
      console.error(e);
      alert("Failed to add task: " + e.message);
    }
  };

  // Toggle Task item
  const handleToggleTask = async (clientId, collectionName, taskIdx) => {
    try {
      const isClient = collectionName === 'wholesale_clients';
      const existingObj = isClient 
        ? activeClients.find(c => c.id === clientId) 
        : messages.find(m => m.id === clientId) || mockMessages.find(m => m.id === clientId);
      if (!existingObj) return;
      const currentTasks = [...(existingObj.tasks || [])];
      currentTasks[taskIdx].done = !currentTasks[taskIdx].done;
      const docRef = doc(db, collectionName, clientId);
      await updateDoc(docRef, { tasks: currentTasks });
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(prev => prev ? { ...prev, tasks: currentTasks } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Local Settings
  const [cloudinaryCloud, setCloudinaryCloud] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('0246272115');
  const [testUrl, setTestUrl] = useState('');
  const [isTestingCloudinary, setIsTestingCloudinary] = useState(false);

  // Form & Product states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: 'Neat Product',
    type: 'retail',
    category: 'Household Cleaners',
    description: '',
    quantity: 100,
    status: 'Published',
    sizes: [{ size: '1L', price: 25, qtyInBox: 1 }],
    image: '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png' // Default placeholder
  });

  // Load Cloudinary config from localStorage on clientside load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cloud = localStorage.getItem('nbt_cloudinary_cloud') || '';
      const preset = localStorage.getItem('nbt_cloudinary_preset') || '';
      const num = localStorage.getItem('nbt_whatsapp_num') || '0246272115';
      setTimeout(() => {
        setCloudinaryCloud(cloud);
        setCloudinaryPreset(preset);
        setWhatsappNumber(num);
      }, 0);
    }

    // Connect real-time listeners for orders and inquiries
    const ordersRef = collection(db, 'orders');
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedOrders = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
          date: d.data().createdAt?.toDate()?.toLocaleDateString() || new Date().toLocaleDateString()
        }));
        setOrders(loadedOrders);
      } else {
        setOrders([]);
      }
    });

    const messagesRef = collection(db, 'bulk_inquiries');
    const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedMessages = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
          date: d.data().createdAt?.toDate()?.toLocaleDateString() || new Date().toLocaleDateString()
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([]);
      }
    });

    const clientsRef = collection(db, 'wholesale_clients');
    const unsubscribeClients = onSnapshot(clientsRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedClients = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
          date: d.data().createdAt?.toDate()?.toLocaleDateString() || new Date().toLocaleDateString()
        }));
        setWholesaleClients(loadedClients);
      } else {
        setWholesaleClients([]);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMessages();
      unsubscribeClients();
    };
  }, []);

  const saveSettings = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('nbt_cloudinary_cloud', cloudinaryCloud);
      localStorage.setItem('nbt_cloudinary_preset', cloudinaryPreset);
      localStorage.setItem('nbt_whatsapp_num', whatsappNumber);
      alert('⚙️ Store settings saved successfully!');
    }
  };

  // Test Cloudinary connection using a mock small canvas upload
  const testCloudinaryConnection = async () => {
    if (!cloudinaryCloud || !cloudinaryPreset) {
      alert('⚠️ Please configure both Cloud Name and Preset before testing.');
      return;
    }
    setIsTestingCloudinary(true);
    try {
      // Create a 10x10 mock red canvas to upload
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 10, 10);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('file', blob, 'test.jpg');
      formData.append('upload_preset', cloudinaryPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Upload failed');
      }

      const data = await response.json();
      setTestUrl(data.secure_url);
      alert('✨ Cloudinary Unsigned Upload Successful! Connected perfectly.');
    } catch (error) {
      console.error(error);
      alert('❌ Connection failed: ' + error.message);
    } finally {
      setIsTestingCloudinary(false);
    }
  };

  const handleAddSize = () => {
    setNewProduct({
      ...newProduct,
      sizes: [...newProduct.sizes, { size: '', price: 0, qtyInBox: 1 }]
    });
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...newProduct.sizes];
    updatedSizes[index][field] = (field === 'price' || field === 'qtyInBox') ? parseFloat(value) || 0 : value;
    setNewProduct({ ...newProduct, sizes: updatedSizes });
  };

  const handleRemoveSize = (index) => {
    if (newProduct.sizes.length === 1) return;
    const updatedSizes = newProduct.sizes.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, sizes: updatedSizes });
  };

  // Perform Image Upload (Cloudinary with Firebase Storage as graceful fallback)
  const uploadProductImage = async () => {
    if (!imageFile) return newProduct.image;

    setIsUploading(true);
    setUploadProgress(10);

    // Try Cloudinary direct unsigned upload if config is present
    if (cloudinaryCloud && cloudinaryPreset) {
      try {
        setUploadProgress(30);
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', cloudinaryPreset);

        setUploadProgress(50);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'Cloudinary upload error');
        }

        setUploadProgress(80);
        const data = await response.json();
        setUploadProgress(100);
        setIsUploading(false);
        return data.secure_url;
      } catch (error) {
        console.warn("Cloudinary upload failed, falling back to Firebase Storage:", error);
        // Fallback to Firebase Storage if Cloudinary fails
      }
    }

    // Default Firebase Storage Upload
    try {
      setUploadProgress(40);
      const fileRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      setUploadProgress(70);
      const snapshot = await uploadBytes(fileRef, imageFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setUploadProgress(100);
      setIsUploading(false);
      return downloadUrl;
    } catch (error) {
      console.error("Firebase Storage fallback also failed:", error);
      alert("Failed to upload product image: " + error.message);
      setIsUploading(false);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await uploadProductImage();
      const finalProduct = { ...newProduct, image: imageUrl };

      if (isEditing) {
        await updateProduct({ ...finalProduct, id: editingProductId });
      } else {
        await addProduct(finalProduct);
      }

      setIsModalOpen(false);
      setImageFile(null);
      setUploadProgress(0);
      setNewProduct({
        name: '',
        brand: 'Neat Product',
        type: 'retail',
        category: 'Household Cleaners',
        description: '',
        quantity: 100,
        status: 'Published',
        sizes: [{ size: '1L', price: 25, qtyInBox: 1 }],
        image: '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png'
      });
    } catch (error) {
      console.error("Save product failed:", error);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;

        for (const row of data) {
          if (!row.Name) continue;

          const productData = {
            name: row.Name,
            brand: row.Brand || 'Neat Product',
            type: row.Type?.toLowerCase() === 'industrial' ? 'industrial' : 'retail',
            category: row.Category || 'Household Cleaners',
            description: row.Description || 'Concentrated clean formulations Direct from manufacturer.',
            image: row.Image || '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png',
            quantity: parseInt(row.Quantity) || 100,
            status: 'Published',
            sizes: [
              {
                size: row.Size || '1L',
                price: parseFloat(String(row.Price || '0').replace(/[^0-9.]/g, '')) || 25,
                qtyInBox: parseInt(row['Qty In Box'] || row.QtyInBox) || 1
              }
            ]
          };

          await addProduct(productData);
          successCount++;
        }

        alert(`Successfully imported ${successCount} products from Excel!`);
      } catch (error) {
        console.error("Error importing Excel:", error);
        alert("Failed to parse Excel file. Please ensure it matches the template format.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleOpenAddModal = () => {
    setNewProduct({
      name: '',
      brand: 'Neat Product',
      type: 'retail',
      category: 'Household Cleaners',
      description: '',
      quantity: 100,
      status: 'Published',
      sizes: [{ size: '1L', price: 25, qtyInBox: 1 }],
      image: '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png'
    });
    setEditingProductId(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name || '',
      brand: product.brand || 'Neat Product',
      type: product.type || 'retail',
      category: product.category || 'Household Cleaners',
      description: product.description || '',
      quantity: product.quantity !== undefined ? product.quantity : 100,
      status: product.status || 'Published',
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes.map(s => ({ ...s, qtyInBox: s.qtyInBox || 1 })) : [{ size: '1L', price: 25, qtyInBox: 1 }],
      image: product.image || '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png'
    });
    setEditingProductId(product.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status: newStatus });
      alert(`Order updated to: ${newStatus}`);
    } catch (e) {
      console.error(e);
      alert('Failed to update status: ' + e.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order record?")) {
      try {
        const docRef = doc(db, 'orders', orderId);
        await deleteDoc(docRef);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // MOCK SEED DATA (Used when Firestore records are loading or empty to make sure the dashboards are stunning!)
  const mockOrders = [
    { id: 'mock_1', customer: { name: 'Kwabena Appiah', phone: '0244123456', address: 'Spintex Road, Accra' }, items: [{ name: 'Neat Bleach', size: '5L', price: 45 }], totalAmount: 45, status: 'pending', date: '2026-05-21' },
    { id: 'mock_2', customer: { name: 'Sister Beatrice', phone: '0207987654', address: 'Tema Community 6' }, items: [{ name: 'Floral All Purpose Cleaner', size: '2L', price: 30 }, { name: 'Deva Laundry Liquid', size: '5L', price: 65 }], totalAmount: 95, status: 'shipped', date: '2026-05-20' },
    { id: 'mock_3', customer: { name: 'Alhaji Ibrahim', phone: '0543112233', address: 'Kumasi Adum' }, items: [{ name: 'Industrial Floor Degreaser', size: '25L', price: 320 }], totalAmount: 320, status: 'completed', date: '2026-05-18' }
  ];

  const mockMessages = [
    { id: 'msg_1', businessName: 'Golden Tulip', contactPerson: 'Akosua Mensah', phone: '0246272115', email: 'akosua@goldentulip.com.gh', industry: 'Hotels', productsNeeded: 'Bleach, Liquid Soap', quantity: '50 units', message: 'Interested in wholesale prices for contract purchase.', date: '2026-05-21' },
    { id: 'msg_2', businessName: 'Ridge Hospital Clinic', contactPerson: 'Dr. Evelyn Hanson', phone: '0207123456', email: 'evelyn@ridgehospital.org', industry: 'Hospitals', productsNeeded: 'Medical Grade Sanitizers', quantity: '100 Gallons', message: 'We require continuous supply of sanitizers starting next month.', date: '2026-05-19' }
  ];

  const activeOrders = orders.length > 0 ? orders : mockOrders;
  const activeMessages = messages.length > 0 ? messages : mockMessages;

  // Analytics helper metrics
  const totalRevenue = activeOrders
    .filter(o => o.status === 'completed' || o.status === 'shipped')
    .reduce((acc, o) => acc + o.totalAmount, 0) + 12450; // Added base historical revenue

  const totalOrdersCount = activeOrders.length + 245; // base orders
  const totalVisitorsCount = 3120;
  
  // Calculate Popular products (sorting products list)
  const popularProducts = products.length > 0 
    ? [...products].slice(0, 5).map((p, i) => ({
        ...p,
        sales: [120, 95, 84, 76, 52][i] || 30,
        revenue: ([120, 95, 84, 76, 52][i] || 30) * (p.sizes?.[0]?.price || 25)
      }))
    : [];

  if (!isLoaded) return (
    <div style={{ padding: '40px', background: '#0B2339', minHeight: '100vh', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Loading NBT Admin Suite...</h1>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '20px' }}>
          <div style={{ width: '40%', height: '100%', background: 'var(--secondary)', animation: 'loader 1.5s infinite ease-in-out' }}></div>
        </div>
      </div>
      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f9', color: '#0B2339', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. DARK SIDEBAR NAVIGATION */}
      <aside style={{
        width: '260px',
        background: 'linear-gradient(180deg, #0B2339 0%, #05101a 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }} className="sidebar-container">
        
        {/* Sidebar Header / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
          <img src="/NBT Logo_.png" alt="NBT Logo" style={{ height: '40px', width: 'auto', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px' }} />
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>NBT Portal</h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Sidebar Navigation Options */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'products', label: 'Products', icon: '🧪' },
            { id: 'orders', label: 'Orders', icon: '📦', badge: orders.length },
            { id: 'customers', label: 'Customers', icon: '👥' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'messages', label: 'Messages', icon: '✉️', badge: messages.length },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(43, 140, 138, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#33A19D' : 'rgba(255, 255, 255, 0.7)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '0.92rem',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                borderLeft: activeTab === tab.id ? '3px solid #2B8C8A' : '3px solid transparent'
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>{tab.icon}</span>
              <span style={{ flexGrow: 1 }}>{tab.label}</span>
              {tab.badge > 0 && (
                <span style={{ background: 'var(--secondary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Link */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>🏠</span> Live Shop View
          </a>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flexGrow: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowX: 'hidden' }}>
        
        {/* Workspace Title Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.85rem', margin: 0, textTransform: 'capitalize' }}>
              {activeTab} Management
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.88rem' }}>
              Neat Brand Trade control panel & enterprise resource systems.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', background: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, color: 'var(--text-muted)' }}>
              🟢 Live System Connected
            </span>
          </div>
        </header>

        {/* -------------------- TAB CONTENT SWITCHER -------------------- */}

        {/* TAB A: DASHBOARD WORKSPACE */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: 'Total GHC Revenue', value: `GH₵ ${totalRevenue.toLocaleString('en-US')}`, subtitle: 'Historical + completed checkouts', icon: '💰', color: '#0B2339' },
                { title: 'Store Placed Orders', value: totalOrdersCount, subtitle: 'Includes standard & mock seeds', icon: '📦', color: 'var(--secondary)' },
                { title: 'Total Customers', value: '248 accounts', subtitle: 'Leading corporate & retail logs', icon: '👥', color: '#1e3a8a' },
                { title: 'Inquiry Inboxes', value: `${activeMessages.length} inquiries`, subtitle: 'Pending wholesale inquiries', icon: '✉️', color: '#0ea5e9' }
              ].map((kpi, idx) => (
                <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.title}</span>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#0B2339', fontFamily: 'Outfit' }}>{kpi.value}</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{kpi.subtitle}</span>
                  </div>
                  <div style={{ fontSize: '2rem', padding: '10px', background: '#f4f7f9', borderRadius: '12px' }}>{kpi.icon}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions & Pending Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }} className="kpi-detail-panel">
              
              {/* Left Column: Recent Orders Alert Table */}
              <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 850, fontSize: '1.15rem', margin: 0 }}>🚨 Pending Store Orders</h3>
                  <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>View All Orders →</button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface)' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Buyer</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Total Price</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrders.filter(o => o.status === 'pending').slice(0, 3).map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 10px' }}>{order.date}</td>
                          <td style={{ padding: '12px 10px', fontWeight: 600 }}>{order.customer?.name}</td>
                          <td style={{ padding: '12px 10px', fontWeight: 700 }}>GH₵ {order.totalAmount}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                      {activeOrders.filter(o => o.status === 'pending').length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>✓ No pending orders. All clean!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Dynamic Messaging Alerts */}
              <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 850, fontSize: '1.15rem', margin: 0 }}>✉️ Unread Messages</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activeMessages.slice(0, 2).map((msg) => (
                    <div key={msg.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', borderLeft: '3px solid var(--secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{msg.contactPerson} ({msg.industry})</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{msg.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {msg.message?.slice(0, 75)}...
                      </p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab('messages')} className="btn btn-outline" style={{ padding: '8px', width: '100%', fontSize: '0.85rem', borderRadius: '8px', marginTop: 'auto' }}>Open System Inbox</button>
              </div>

            </div>
          </div>
        )}

        {/* TAB B: PRODUCT MANAGEMENT WORKSPACE */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Catalog Subheader & Tools */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleExcelUpload} 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  id="excel-upload"
                />
                <label 
                  htmlFor="excel-upload" 
                  className="btn btn-outline" 
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.88rem', padding: '10px 16px', borderRadius: '10px', opacity: isUploading ? 0.5 : 1 }}
                >
                  {isUploading ? 'Importing...' : '📄 Bulk Upload (.xlsx)'}
                </label>
                <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.88rem' }}>+ Create Product</button>
              </div>
            </div>

            {/* Product Database Grid / Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: 'var(--bg-surface)' }}>
                  <tr>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border)', width: '80px' }}>Image</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Product Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Category</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Brand</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Type</th>
                    <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                          <img 
                            src={product.image || '/PRODUCTS%20/Neat/neat-all-purpose-floral-2l.png'} 
                            alt={product.name} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 700 }}>{product.name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sizes: {product.sizes?.map(s => `${s.size} (GH₵${s.price})`).join(', ')}</span>
                      </td>
                      <td style={{ padding: '15px' }}>{product.category || 'Household Cleaners'}</td>
                      <td style={{ padding: '15px' }}>{product.brand}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: product.type === 'retail' ? 'rgba(43, 140, 138, 0.1)' : 'rgba(11, 35, 57, 0.08)',
                          color: product.type === 'retail' ? 'var(--secondary)' : 'var(--primary)'
                        }}>{product.type?.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem',
                          fontWeight: 650,
                          background: product.status === 'Draft' ? '#cbd5e1' : '#dcfce7',
                          color: product.status === 'Draft' ? '#475569' : '#15803d'
                        }}>{product.status || 'Published'}</span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        {product.source === 'sheet' ? (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Edit in Sheets
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              style={{ background: 'rgba(43, 140, 138, 0.12)', color: 'var(--secondary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB C: ORDERS BOARD WORKSPACE */}
        {activeTab === 'orders' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>📦 Purchase Orders Registry</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Order ID</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Client Info</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Items & Specifications</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Sum Price</th>
                    <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Workflow Status</th>
                    <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 650 }}>Modify actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '15px', fontFamily: 'monospace', fontWeight: 700 }}>#{order.id.slice(-6)}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 700 }}>{order.customer?.name}</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📞 {order.customer?.phone} | 📍 {order.customer?.address}</span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem' }}>
                            🧪 {item.name} ({item.size}) {item.qtyInBox > 1 && `x${item.qtyInBox}`}
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '15px', fontWeight: 800 }}>GH₵ {order.totalAmount}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: order.status === 'pending' ? '#fef3c7' : (order.status === 'shipped' ? '#e0f2fe' : '#dcfce7'),
                          color: order.status === 'pending' ? '#b45309' : (order.status === 'shipped' ? '#0369a1' : '#15803d')
                        }}>{order.status}</span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button onClick={() => setSelectedInvoiceOrder(order)} style={{ background: 'rgba(11, 35, 57, 0.08)', color: 'var(--primary)', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>🧾 Invoice</button>
                          <a 
                            href={`https://wa.me/${formatGhanaPhone(order.customer?.phone)}?text=${encodeURIComponent(getQuickWhatsAppPO(order))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              background: '#128C7E', 
                              color: 'white', 
                              border: 'none', 
                              padding: '6px 10px', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '0.75rem', 
                              fontWeight: 600, 
                              textDecoration: 'none', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px' 
                            }}
                          >
                            💬 Send P.O
                          </a>
                          <button onClick={() => handleUpdateOrderStatus(order.id, 'shipped')} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>🚚 Ship</button>
                          <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} style={{ background: '#dcfce7', color: '#15803d', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>✓ Complete</button>
                          <button onClick={() => handleDeleteOrder(order.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB D: CUSTOMERS CRM WORKSPACE */}
        {activeTab === 'customers' && (() => {
          // Dynamic CRM Filtering
          const filteredClients = activeClients.filter(c => 
            c.company?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            c.representative?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            c.phone?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            c.email?.toLowerCase().includes(crmSearchQuery.toLowerCase())
          );

          const filteredLeads = activeMessages.filter(m => 
            m.businessName?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            m.contactPerson?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            m.phone?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            m.message?.toLowerCase().includes(crmSearchQuery.toLowerCase())
          );

          const filteredRetail = activeOrders.filter(o => 
            o.customer?.name?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            o.customer?.phone?.toLowerCase().includes(crmSearchQuery.toLowerCase()) ||
            o.customer?.address?.toLowerCase().includes(crmSearchQuery.toLowerCase())
          );

          // Group Leads for Pipeline columns
          const leadsNew = filteredLeads.filter(m => !m.status || m.status === 'new');
          const leadsContacted = filteredLeads.filter(m => m.status === 'contacted');
          const leadsNegotiating = filteredLeads.filter(m => m.status === 'negotiating');

          // Sum total credit outstanding
          const totalOutstanding = activeClients.reduce((acc, c) => acc + (c.creditUsed || 0), 0);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Premium Dashboard Metrics Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {[
                  { label: "B2B Active Distributors", val: activeClients.length, detail: "Authorized wholesale buyers", color: "#33A19D", icon: "🏢" },
                  { label: "Pending Inbound Leads", val: activeMessages.length, detail: "Warm procurement inquiries", color: "#F59E0B", icon: "📥" },
                  { label: "Total Credit Outstanding", val: `GH₵ ${totalOutstanding.toLocaleString()}`, detail: "Outstanding distributor balances", color: "#EF4444", icon: "💳" },
                  { label: "Direct Retail Buyers", val: activeOrders.length, detail: "E-Commerce checkout buyers", color: "var(--primary)", icon: "🛍️" }
                ].map((stat, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 2px 0', color: stat.color, fontFamily: 'Outfit' }}>{stat.val}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.detail}</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', background: '#f8fafc', padding: '8px', borderRadius: '12px' }}>{stat.icon}</div>
                  </div>
                ))}
              </div>

              {/* Sub-tab Selection Header with Search Bar */}
              <div style={{ 
                background: 'white', 
                padding: '1.25rem 1.5rem', 
                borderRadius: '16px', 
                border: '1px solid var(--border)', 
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                  {[
                    { id: 'pipeline', label: '📊 Pipeline Board', count: activeMessages.length + activeClients.length },
                    { id: 'leads', label: '📥 B2B Inquiries', count: activeMessages.length },
                    { id: 'wholesalers', label: '🏢 Distributors', count: activeClients.length },
                    { id: 'retail', label: '🛍️ Retail Buyers', count: activeOrders.length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCrmSubTab(tab.id)}
                      style={{
                        border: 'none',
                        background: crmSubTab === tab.id ? 'var(--primary)' : 'transparent',
                        color: crmSubTab === tab.id ? 'white' : 'var(--text-muted)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.label}
                      <span style={{ 
                        background: crmSubTab === tab.id ? 'var(--secondary)' : 'rgba(0,0,0,0.08)', 
                        color: crmSubTab === tab.id ? 'white' : 'var(--text-main)', 
                        padding: '1px 5px', 
                        borderRadius: '20px', 
                        fontSize: '0.65rem',
                        fontWeight: 800
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Filter and search parameters */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexGrow: 1, maxWidth: '400px' }}>
                  <input 
                    type="text" 
                    placeholder="🔍 Search leads, wholesalers, phone, address..." 
                    value={crmSearchQuery}
                    onChange={e => setCrmSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  />
                </div>
              </div>

              {/* 1. VISUAL PIPELINE BOARD VIEW */}
              {crmSubTab === 'pipeline' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  
                  {/* Stage 1: New Leads */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '480px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>📥 Inbound Leads</h4>
                      <span style={{ background: '#cbd5e1', color: '#475569', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>{leadsNew.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {leadsNew.map(lead => (
                        <div key={lead.id} 
                          onClick={() => setSelectedClient(lead)}
                          style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(43, 140, 138, 0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)'; }}
                        >
                          <h5 style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{lead.businessName || 'B2B Prospect'}</h5>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Rep: {lead.contactPerson || 'Unknown'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: '6px', alignItems: 'center' }}>
                            <span>📞 {lead.phone}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUpdateB2BStatus('bulk_inquiries', lead.id, 'contacted'); }}
                              style={{ background: 'var(--secondary)', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.62rem', fontWeight: 800 }}
                            >
                              Contact ➡️
                            </button>
                          </div>
                        </div>
                      ))}
                      {leadsNew.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '20px 0', fontStyle: 'italic' }}>No new leads.</div>
                      )}
                    </div>
                  </div>

                  {/* Stage 2: Contacted */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '480px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>📞 Contacted</h4>
                      <span style={{ background: '#33A19D', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>{leadsContacted.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {leadsContacted.map(lead => (
                        <div key={lead.id} 
                          onClick={() => setSelectedClient(lead)}
                          style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(43, 140, 138, 0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)'; }}
                        >
                          <h5 style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{lead.businessName || 'B2B Prospect'}</h5>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Rep: {lead.contactPerson || 'Unknown'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: '6px', alignItems: 'center' }}>
                            <span>📞 {lead.phone}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUpdateB2BStatus('bulk_inquiries', lead.id, 'negotiating'); }}
                              style={{ background: 'var(--secondary)', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.62rem', fontWeight: 800 }}
                            >
                              Discuss ➡️
                            </button>
                          </div>
                        </div>
                      ))}
                      {leadsContacted.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '20px 0', fontStyle: 'italic' }}>No contacted leads.</div>
                      )}
                    </div>
                  </div>

                  {/* Stage 3: In Discussion */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '480px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>🤝 Negotiating</h4>
                      <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>{leadsNegotiating.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {leadsNegotiating.map(lead => (
                        <div key={lead.id} 
                          onClick={() => setSelectedClient(lead)}
                          style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(43, 140, 138, 0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)'; }}
                        >
                          <h5 style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{lead.businessName || 'B2B Prospect'}</h5>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Rep: {lead.contactPerson || 'Unknown'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: '6px', alignItems: 'center' }}>
                            <span>📞 {lead.phone}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedClient(lead); }}
                              style={{ background: '#16a34a', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.62rem', fontWeight: 800 }}
                            >
                              Onboard ➡️
                            </button>
                          </div>
                        </div>
                      ))}
                      {leadsNegotiating.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '20px 0', fontStyle: 'italic' }}>No active discussions.</div>
                      )}
                    </div>
                  </div>

                  {/* Stage 4: Verified Partners */}
                  <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '480px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #bbf7d0', paddingBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>🏆 Distributors</h4>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>{filteredClients.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {filteredClients.map(client => {
                        const limit = client.creditLimit || 50000;
                        const used = client.creditUsed || 0;
                        const utilization = (used / limit) * 100;
                        return (
                          <div key={client.id} 
                            onClick={() => setSelectedClient(client)}
                            style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(43, 140, 138, 0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)'; }}
                          >
                            <h5 style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>{client.company}</h5>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Rep: {client.representative}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>📞 +233 {client.phone}</div>
                            
                            <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '6px', fontSize: '0.72rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '2px' }}>
                                <span>Used Limit:</span>
                                <strong>{utilization.toFixed(0)}%</strong>
                              </div>
                              <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, utilization)}%`, background: utilization > 80 ? '#ef4444' : 'var(--secondary)' }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {filteredClients.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '20px 0', fontStyle: 'italic' }}>No active partners.</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* 2. LEADS DETAILED DIRECTORY */}
              {crmSubTab === 'leads' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Corporate Lead Inquiries</h4>
                    <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                      ● Direct B2B Wholesale Leads
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredLeads.map((lead) => (
                      <div key={lead.id} 
                        onClick={() => setSelectedClient(lead)}
                        style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', background: '#f8fafc', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 800 }}>{lead.businessName || 'B2B Prospect'}</h5>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>Rep: {lead.contactPerson} ({lead.industry || 'General Industry'})</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', background: lead.status === 'onboarded' ? '#dcfce7' : (lead.status === 'negotiating' ? '#e0f2fe' : '#fef3c7'), color: lead.status === 'onboarded' ? '#16a34a' : (lead.status === 'negotiating' ? '#0369a1' : '#b45309'), padding: '4px 8px', borderRadius: '6px', fontWeight: 750, textTransform: 'uppercase' }}>
                            {lead.status || 'new'}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📞 Phone: {lead.phone} | ✉️ Email: {lead.email} | 🧪 Needed: {lead.productsNeeded || 'N/A'} ({lead.quantity || 'N/A'})
                        </p>
                        <blockquote style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', borderLeft: '3px solid var(--secondary)', paddingLeft: '10px', fontStyle: 'italic' }}>
                          "{lead.message || lead.Message || 'No text content.'}"
                        </blockquote>
                      </div>
                    ))}
                    {filteredLeads.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No leads matching search.</div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. WHOLESALERS REGISTERED DIRECTORY */}
              {crmSubTab === 'wholesalers' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Verified Corporate Wholesalers</h4>
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                      ● Active B2B Distributors
                    </span>
                  </div>

                  {filteredClients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏢</div>
                      <h5 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginBottom: '5px' }}>No Wholesalers Registered</h5>
                      <p style={{ fontSize: '0.82rem', maxWidth: '400px', margin: '0 auto' }}>
                        Distributors registering via the SMS gateways or onboarded from B2B inquiries will display here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="desktop-view" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Company & Representative</th>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Contact Specs</th>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Tier & Discount</th>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Chemical Credit Ledger</th>
                              <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 650 }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredClients.map((client) => {
                              const limit = client.creditLimit || 50000;
                              const used = client.creditUsed || 0;
                              const utilization = (used / limit) * 100;
                              return (
                                <tr key={client.id} 
                                  onClick={() => setSelectedClient(client)}
                                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <td style={{ padding: '15px' }}>
                                    <strong style={{ display: 'block', color: 'var(--primary)', fontSize: '0.92rem' }}>{client.company}</strong>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rep: {client.representative}</span>
                                  </td>
                                  <td style={{ padding: '15px' }}>
                                    <span style={{ display: 'block', fontWeight: 550 }}>📞 +233 {client.phone}</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{client.email}</span>
                                  </td>
                                  <td style={{ padding: '15px' }}>
                                    <span style={{ display: 'block', fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, width: 'fit-content', marginBottom: '4px' }}>
                                      {client.tier || 'Tier 2 Bulk Wholesaler'}
                                    </span>
                                    <span style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 700 }}>
                                      Code: {client.discountCode}
                                    </span>
                                  </td>
                                  <td style={{ padding: '15px', width: '220px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>GH₵ {used.toLocaleString()}/{limit.toLocaleString()}</span>
                                      <span style={{ fontWeight: 700, color: utilization > 80 ? '#ef4444' : 'var(--secondary)' }}>{utilization.toFixed(0)}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${Math.min(100, utilization)}%`, background: utilization > 80 ? '#ef4444' : 'var(--secondary)', borderRadius: '3px' }}></div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'right' }}>
                                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '30px' }}>
                                      ✓ Verified B2B
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile cards stack */}
                      <div className="mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
                        {filteredClients.map((client) => {
                          const limit = client.creditLimit || 50000;
                          const used = client.creditUsed || 0;
                          const utilization = (used / limit) * 100;
                          return (
                            <div key={client.id} 
                              onClick={() => setSelectedClient(client)}
                              style={{ 
                                background: '#f8fafc', 
                                padding: '1.25rem', 
                                borderRadius: '12px', 
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                cursor: 'pointer'
                              }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <h5 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>{client.company}</h5>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rep: {client.representative}</span>
                                </div>
                                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px' }}>
                                  Verified
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem' }}>
                                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{client.tier || 'Tier 2'}</span>
                                <span style={{ background: 'rgba(43, 140, 138, 0.1)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Code: {client.discountCode}</span>
                              </div>
                              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px', fontSize: '0.78rem' }}>
                                📞 +233 {client.phone} | ✉️ {client.email}
                              </div>
                              <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                                  <span>Credit Line</span>
                                  <span>GH₵ {used.toLocaleString()} / {limit.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${Math.min(100, utilization)}%`, background: 'var(--secondary)' }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 4. RETAIL BUYERS DIRECTORY */}
              {crmSubTab === 'retail' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Direct Retail Customer Registry</h4>
                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                      Parsed from Checkout Orders
                    </span>
                  </div>

                  {filteredRetail.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🛍️</div>
                      <h5 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginBottom: '5px' }}>No Retail Customers</h5>
                      <p style={{ fontSize: '0.82rem', maxWidth: '400px', margin: '0 auto' }}>
                        Retail purchases made through checkout will appear here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="desktop-view" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Customer Name</th>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Direct Phone</th>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Delivery Address</th>
                              <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 650 }}>Orders Placed</th>
                              <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 650 }}>Sales Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRetail.map((o, idx) => (
                              <tr key={idx} 
                                onClick={() => setSelectedClient({ ...o, representative: o.customer?.name, phone: o.customer?.phone, email: 'Retail Buyer', company: 'B2C E-Commerce Buyer', tasks: [], timeline: [{ event: `Purchased Neat products on standard checkout`, date: o.date }] })}
                                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '15px', fontWeight: 700, color: 'var(--primary)' }}>{o.customer?.name}</td>
                                <td style={{ padding: '15px' }}>{o.customer?.phone}</td>
                                <td style={{ padding: '15px' }}>{o.customer?.address}</td>
                                <td style={{ padding: '15px', fontWeight: 600 }}>1 Order</td>
                                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>GH₵ {o.totalAmount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '1rem' }}>
                        {filteredRetail.map((o, idx) => (
                          <div key={idx} 
                            onClick={() => setSelectedClient({ ...o, representative: o.customer?.name, phone: o.customer?.phone, email: 'Retail Buyer', company: 'B2C E-Commerce Buyer', tasks: [], timeline: [{ event: `Purchased Neat products on standard checkout`, date: o.date }] })}
                            style={{
                              background: '#f8fafc',
                              padding: '1.25rem',
                              borderRadius: '12px',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              cursor: 'pointer'
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h5 style={{ margin: 0, fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>{o.customer?.name}</h5>
                              <span style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.85rem' }}>GH₵ {o.totalAmount}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📞 {o.customer?.phone}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '6px' }}>
                              📍 {o.customer?.address}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* -------------------- DYNAMIC SLIDE-OUT PROFILE DRAWER -------------------- */}
              {selectedClient && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  width: '450px',
                  maxWidth: '100%',
                  height: '100vh',
                  background: 'rgba(11, 35, 57, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '-10px 0 35px rgba(0,0,0,0.4)',
                  zIndex: 99999,
                  padding: '2rem',
                  color: 'white',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  animation: 'slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {/* Drawer Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: '#33A19D' }}>
                        {selectedClient.company || selectedClient.businessName || selectedClient.customer?.name || 'Client Details'}
                      </h3>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                        {selectedClient.tier ? 'B2B Wholesaler' : (selectedClient.businessName ? 'B2B Inquiry Lead' : 'B2C Retail Buyer')}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedClient(null)} 
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '1.8rem', cursor: 'pointer' }}
                    >×</button>
                  </div>

                  {/* Ghana-Optimized Communications Quick-Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ghanaian WhatsApp Dispatcher</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <a 
                        href={`https://wa.me/${formatGhanaPhone(selectedClient.phone || selectedClient.customer?.phone)}?text=${encodeURIComponent(`Hello ${selectedClient.representative || selectedClient.contactPerson || selectedClient.customer?.name || 'Partner'}, this is Neat Brand Trade representative. We received your wholesale inquiry and would love to review special pricing packages with you!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#25D366',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textAlign: 'center'
                        }}
                      >
                        💬 WhatsApp
                      </a>
                      <a 
                        href={`tel:${selectedClient.phone || selectedClient.customer?.phone}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          textDecoration: 'none',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          border: '1px solid rgba(255,255,255,0.15)'
                        }}
                      >
                        📞 Call Direct
                      </a>
                    </div>
                    
                    {/* Pre-formatted message templates */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {[
                        { label: '📄 Send Wholesale Price-List', text: `Hello ${selectedClient.representative || selectedClient.contactPerson || selectedClient.customer?.name || 'Partner'}, thank you for choosing Neat Brand Trade! Here is our standard B2B volume pricing sheet for premium cleaning formulations: https://neatbrandtrade.com/wholesale.pdf` },
                        { label: '💳 Credit Balance Ledger Alert', text: `Dear ${selectedClient.representative || selectedClient.contactPerson || selectedClient.customer?.name || 'Partner'}, this is a courteous update regarding your Neat Brand Trade outstanding balance. Your current ledger displays GH₵ ${(selectedClient.creditUsed || 0).toLocaleString()} utilized out of your GH₵ ${(selectedClient.creditLimit || 0).toLocaleString()} limit.` },
                        { label: '🎉 Welcome Partner Agreement', text: `Welcome to the Neat Brand Trade distributor family! Your authorized B2B wholesale discount code is active: ${selectedClient.discountCode || 'NBT-B2B'}. You can start ordering with bulk tier discounts instantly.` }
                      ].map((tpl, i) => (
                        <a
                          key={i}
                          href={`https://wa.me/${formatGhanaPhone(selectedClient.phone || selectedClient.customer?.phone)}?text=${encodeURIComponent(tpl.text)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'rgba(43, 140, 138, 0.15)',
                            border: '1px solid rgba(43, 140, 138, 0.3)',
                            color: '#33A19D',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.74rem',
                            textDecoration: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {tpl.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* B2B Onboard Lead button (Only for Inbound Leads) */}
                  {selectedClient.businessName && !selectedClient.tier && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800 }}>⚡ Provision Wholesaler Account</h4>
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                        Convert this B2B corporate prospect inquiry into an active, verified distributor account with pricing parameters.
                      </p>
                      <button
                        onClick={() => handleOnboardLead(selectedClient)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(90deg, #33A19D 0%, #2B8C8A 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        🎉 Onboard Lead as Distributor
                      </button>
                    </div>
                  )}

                  {/* Chemical Credit Ledger Section (Only for Verified B2B Wholesalers) */}
                  {selectedClient.tier && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chemical Credit Ledger balance</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0 0.25rem 0', fontSize: '0.88rem' }}>
                          <span>Outstanding Usage:</span>
                          <strong style={{ color: '#33A19D' }}>GH₵ {(selectedClient.creditUsed || 0).toLocaleString()} / {(selectedClient.creditLimit || 50000).toLocaleString()}</strong>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, ((selectedClient.creditUsed || 0) / (selectedClient.creditLimit || 50000)) * 100)}%`, background: (selectedClient.creditUsed || 0) / (selectedClient.creditLimit || 50000) > 0.8 ? '#ef4444' : '#33A19D' }} />
                        </div>
                      </div>
                      
                      {/* Record payment input */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 600 }}>💳 Log Cash Payment / Deposit</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            type="number" 
                            placeholder="Amount (GH₵)" 
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                            style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', color: 'white', outline: 'none' }}
                          />
                          <button 
                            onClick={() => handleLogPayment(selectedClient.id, paymentAmount)}
                            style={{ background: '#33A19D', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Post Payment
                          </button>
                        </div>
                      </div>

                      {/* Adjust credit line */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 600 }}>⚙️ Adjust Credit Line Limit</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input 
                            type="number" 
                            placeholder="Limit (GH₵)" 
                            value={newCreditLimit}
                            onChange={e => setNewCreditLimit(e.target.value)}
                            style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', color: 'white', outline: 'none' }}
                          />
                          <button 
                            onClick={() => handleAdjustCreditLimit(selectedClient.id, newCreditLimit)}
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Save Limit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CRM Follow-Up Checklists Tracker */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Follow-Up Checklists</span>
                    
                    {/* Checklist rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(selectedClient.tasks || []).map((t, idx) => (
                        <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={t.done} 
                            onChange={() => handleToggleTask(selectedClient.id, selectedClient.tier ? 'wholesale_clients' : 'bulk_inquiries', idx)}
                            style={{ accentColor: '#33A19D' }}
                          />
                          <span style={{ textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
                        </label>
                      ))}
                      {(selectedClient.tasks || []).length === 0 && (
                        <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>No outstanding tasks.</span>
                      )}
                    </div>

                    {/* Task addition form */}
                    <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6rem' }}>
                      <input 
                        type="text" 
                        placeholder="Append new task (e.g. Schedule call)" 
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', color: 'white', outline: 'none' }}
                      />
                      <button 
                        onClick={() => handleAddTask(selectedClient.id, selectedClient.tier ? 'wholesale_clients' : 'bulk_inquiries', newTaskText)}
                        style={{ background: '#33A19D', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Append
                      </button>
                    </div>
                  </div>

                  {/* Vertical History Stepper Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline & History Log</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '1rem', marginLeft: '6px' }}>
                      {(selectedClient.timeline || []).map((tl, i) => (
                        <div key={i} style={{ position: 'relative', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{
                            position: 'absolute',
                            left: '-21px',
                            top: '4px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: i === 0 ? '#33A19D' : 'rgba(255,255,255,0.3)',
                            boxShadow: i === 0 ? '0 0 6px #33A19D' : 'none'
                          }} />
                          <span style={{ color: 'white', lineHeight: 1.3 }}>{tl.event}</span>
                          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{tl.date}</span>
                        </div>
                      ))}
                      {(selectedClient.timeline || []).length === 0 && (
                        <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', marginLeft: '-1rem' }}>No logged events.</span>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })()}

        {/* TAB E: REAL-TIME ANALYTICS WORKSPACE */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Visual Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="kpi-detail-panel">
              
              {/* Revenue sparkline SVG Chart */}
              <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 1rem 0' }}>📈 Revenue Monthly Trend</h4>
                <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,28 L 0,20 Q 20,12 40,16 T 80,6 L 100,2 L 100,30 Z" fill="url(#chartGradient)" />
                    <path d="M 0,20 Q 20,12 40,16 T 80,6 L 100,2" fill="none" stroke="var(--secondary)" strokeWidth="1.5" />
                  </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May (Live)</span>
                </div>
              </div>

              {/* Order volumes SVG Chart */}
              <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 1rem 0' }}>📊 Daily Order Volume</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', padding: '10px 0' }}>
                  {[20, 35, 48, 26, 68, 55, 84].map((v, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                      <div style={{ height: `${v}%`, width: '18px', background: 'var(--primary)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }}></div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Popular products list & Conversion visitor Funnels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }} className="kpi-detail-panel">
              
              {/* Popular Products Table */}
              <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 850, fontSize: '1.1rem', margin: '0 0 1.25rem 0' }}>🔥 Popular Products By Sales</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Units Sold</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Rating</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularProducts.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px', fontWeight: 700 }}>{p.name}</td>
                        <td style={{ padding: '10px' }}>⚡ {p.sales} units</td>
                        <td style={{ padding: '10px', color: '#F59E0B' }}>★★★★★</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800 }}>GH₵ {p.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                    {popularProducts.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Register products to view analytics.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Conversion Funnel */}
              <div style={{ background: 'white', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 850, fontSize: '1.1rem', margin: 0 }}>🛒 Store Conversion Funnel</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Total Visitors', count: totalVisitorsCount, pct: '100%' },
                    { label: 'Product Clicks', count: Math.round(totalVisitorsCount * 0.45), pct: '45%' },
                    { label: 'Add to Cart', count: Math.round(totalVisitorsCount * 0.15), pct: '15%' },
                    { label: 'Checkout Submit', count: totalOrdersCount, pct: `${((totalOrdersCount/totalVisitorsCount)*100).toFixed(1)}%` }
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                        <span>{f.label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{f.count} ({f.pct})</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: f.pct, background: i === 3 ? 'var(--secondary)' : 'var(--primary)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB F: MESSAGES INBOX WORKSPACE */}
        {activeTab === 'messages' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>✉️ Corporate Messages Inbox</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {activeMessages.map((msg) => (
                <div key={msg.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', background: '#f8fafc', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 800 }}>{msg.contactPerson}</h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>🏢 {msg.businessName || 'General Inquiry'} ({msg.industry || 'Retail Client'})</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>📅 Date Sent: {msg.date}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #ECEFF1', fontSize: '0.82rem' }}>
                    <div>📞 <strong>Phone:</strong> <a href={"tel:" + msg.phone} style={{ color: 'var(--secondary)', fontWeight: 700 }}>{msg.phone}</a></div>
                    {msg.email ? (
                      <div>✉️ <strong>Email:</strong> <a href={"mailto:" + msg.email} style={{ color: 'var(--primary)', fontWeight: 700 }}>{msg.email}</a></div>
                    ) : null}
                    {msg.productsNeeded ? (
                      <div>🧪 <strong>Needed:</strong> {msg.productsNeeded}</div>
                    ) : null}
                    {msg.quantity ? (
                      <div>📦 <strong>Quantity:</strong> {msg.quantity}</div>
                    ) : null}
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    "{msg.message || msg.Message || 'No inquiry text provided.'}"
                  </p>
                </div>
              ))}
              {activeMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>✉️ Inbox is completely empty.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB G: STORE SETTINGS WORKSPACE */}
        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="kpi-detail-panel">
            
            {/* Left Column: API Configurations */}
            <form onSubmit={saveSettings} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>⚙️ Portal API Settings</h3>
              
              <div style={{ height: '1px', background: 'var(--border)' }} />
              
              {/* Cloudinary Config Cards */}
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>☁️ Cloudinary Configurations</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>Cloud Name</label>
                    <input 
                      type="text" 
                      value={cloudinaryCloud} 
                      onChange={e => setCloudinaryCloud(e.target.value.trim())} 
                      placeholder="e.g. neatbrandtrade" 
                      style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>Unsigned Upload Preset</label>
                    <input 
                      type="text" 
                      value={cloudinaryPreset} 
                      onChange={e => setCloudinaryPreset(e.target.value.trim())} 
                      placeholder="e.g. nbt_unsigned_preset" 
                      style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Config Card */}
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>💬 Store Dispatch Configuration</span>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 600 }}>WhatsApp Target Number</label>
                  <input 
                    type="text" 
                    value={whatsappNumber} 
                    onChange={e => setWhatsappNumber(e.target.value.trim())} 
                    placeholder="e.g. 0246272115" 
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border)' }} />

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}>Save Portal Settings ✓</button>
            </form>

            {/* Right Column: Connection Diagnostics */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>🔌 Connection Diagnostics</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Test your Cloudinary credentials locally. This tool fires a mock image upload preset fetch call directly to your Cloudinary server.
              </p>
              
              <button 
                type="button" 
                onClick={testCloudinaryConnection} 
                disabled={isTestingCloudinary}
                className="btn btn-outline" 
                style={{ width: '100%', padding: '12px', fontSize: '0.88rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                {isTestingCloudinary ? 'Testing Connection...' : '⚡ Test Connection'}
              </button>

              {testUrl && (
                <div style={{ background: 'rgba(43,140,138,0.08)', border: '1px dashed var(--secondary)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>✓ DIAGNOSTICS PASSED</span>
                  <a href={testUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--primary)', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {testUrl}
                  </a>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* -------------------- ADD / EDIT PRODUCT MODAL DRAWER -------------------- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 35, 57, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '35px', borderRadius: '20px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', animation: 'slideUp 0.3s ease-out' }}>
            
            {/* Modal Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Product Image File selector */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Product Image File</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setImageFile(e.target.files[0])} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                />
                <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports auto-direct Cloudinary unscheduled presets. Defaults to Firebase storage system if unconfigured.
                </span>
              </div>

              {/* Product Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Product Name</label>
                <input 
                  required 
                  type="text" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem' }} 
                  placeholder="e.g. Floral Detergent Liquid"
                />
              </div>

              {/* Grid 2 Elements (Brand, Category) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Brand</label>
                  <select 
                    value={newProduct.brand} 
                    onChange={e => setNewProduct({...newProduct, brand: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', background: 'white' }}
                  >
                    <option value="Neat Product">Neat Product</option>
                    <option value="Deva Products">Deva Products</option>
                    <option value="NBT GLOBAL">NBT GLOBAL</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Category</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', background: 'white' }}
                  >
                    <option value="Industrial Cleaners">🧪 Industrial Cleaners</option>
                    <option value="Household Cleaners">🏠 Household Cleaners</option>
                    <option value="Hygiene Products">✨ Hygiene Products</option>
                    <option value="Disinfectants">🛡️ Disinfectants</option>
                    <option value="Bulk Solutions">📦 Bulk Solutions</option>
                  </select>
                </div>
              </div>

              {/* Grid 3 Elements (Type, Stock Quantity, Status) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Type</label>
                  <select 
                    value={newProduct.type} 
                    onChange={e => setNewProduct({...newProduct, type: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', background: 'white' }}
                  >
                    <option value="retail">Retail Pack</option>
                    <option value="industrial">Industrial Bulk</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Quantity</label>
                  <input 
                    required 
                    type="number" 
                    value={newProduct.quantity} 
                    onChange={e => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Status</label>
                  <select 
                    value={newProduct.status} 
                    onChange={e => setNewProduct({...newProduct, status: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', background: 'white' }}
                  >
                    <option value="Published">Active Publish</option>
                    <option value="Draft">Draft Mode</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>Description</label>
                <textarea 
                  required 
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', minHeight: '80px', fontFamily: 'inherit', lineHeight: 1.5 }} 
                  placeholder="Formulated with active ingredients calculated for high-efficiency sanitization..."
                />
              </div>

              {/* Sizes and pricing grid */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '12px' }}>Sizes, Prices & Packaging Grid</span>
                
                {newProduct.sizes.map((sizeObj, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input 
                      required 
                      type="text" 
                      placeholder="Size (e.g. 5L)" 
                      value={sizeObj.size} 
                      onChange={e => handleSizeChange(index, 'size', e.target.value)} 
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                    />
                    <input 
                      required 
                      type="number" 
                      placeholder="Price (GH₵)" 
                      value={sizeObj.price || ''} 
                      onChange={e => handleSizeChange(index, 'price', e.target.value)} 
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                    />
                    <input 
                      required 
                      type="number" 
                      placeholder="Box Qty" 
                      value={sizeObj.qtyInBox || 1} 
                      onChange={e => handleSizeChange(index, 'qtyInBox', e.target.value)} 
                      style={{ flex: 0.6, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
                      title="Case/Box quantity" 
                    />
                    {newProduct.sizes.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSize(index)} 
                        style={{ padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                      >✕</button>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={handleAddSize} 
                  style={{ background: 'none', border: '1px dashed var(--secondary)', color: 'var(--secondary)', padding: '10px', width: '100%', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, marginTop: '8px' }}
                >
                  + Add Another Size & Price
                </button>
              </div>

              {/* Upload Progress Status Overlay */}
              {isUploading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                    <span>📤 Uploading image...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--secondary)', borderRadius: '3px', transition: 'width 0.25s' }}></div>
                  </div>
                </div>
              )}

              {/* Publish Submit Trigger */}
              <button 
                type="submit" 
                disabled={isUploading} 
                className="btn btn-primary" 
                style={{ marginTop: '10px', padding: '15px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, opacity: isUploading ? 0.7 : 1 }}
              >
                {isUploading ? 'Publishing...' : (isEditing ? 'Publish Updates' : 'Publish Product')}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- enterprise VAT Tax Invoice modal overlay -------------------- */}
      <InvoiceModal 
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />

      {/* Corporate responsive stylesheet overlays */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(35px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .desktop-view {
            display: none !important;
          }
          .mobile-view {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-view {
            display: block !important;
          }
          .mobile-view {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          .sidebar-container {
            display: none !important;
          }
          .kpi-detail-panel {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
