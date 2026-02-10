﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { useState, useEffect, useMemo, useRef } from 'react';
import { storeService, productService, stockService, stockTypeService, userService, authService } from '../services';
import { useNavigate } from 'react-router-dom';
import SearchableDropdown from '../components/SearchableDropdown';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Menu States
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStockMenuOpen, setIsStockMenuOpen] = useState(false);

    // Data States
    const [stocks, setStocks] = useState([]);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Filter States
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');
    const [filterProvince, setFilterProvince] = useState('');
    const [filterChannel, setFilterChannel] = useState('');
    const [filterSubChannel, setFilterSubChannel] = useState('');
    const [filterStore, setFilterStore] = useState('');
    const [filterSku, setFilterSku] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [storeSearchTerm, setStoreSearchTerm] = useState("");
    const [productSearchTerm, setProductSearchTerm] = useState("");

    // --- Missing States Restored ---
    const [editingStock, setEditingStock] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Approval Modal State
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalForm, setApprovalForm] = useState({
        approved_qty: '',
        delivery_date: '',
        order_number: '',
        receipt_number: '',
        tracking_status: 'Being Package'
    });
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingForm, setTrackingForm] = useState({
        tracking_status: ''
    });

    const [editForm, setEditForm] = useState({
        stock_type: '',
        recent_stock: ''
    });

    const [addStockForm, setAddStockForm] = useState({
        storeId: "",
        skuCode: "",
        stockType: "Penjualan",
        qty: "",
        message: "",
        isLoading: false,
        currentStock: 0
    });

    const [addAccountForm, setAddAccountForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
        storeId: "",
        message: "",
        isLoading: false
    });

    const [stockTypes, setStockTypes] = useState([]);
    const [addStockTypeForm, setAddStockTypeForm] = useState({
        name: "",
        message: "",
        isLoading: false
    });
    const [editingStockType, setEditingStockType] = useState(null);
    const [editStockTypeForm, setEditStockTypeForm] = useState({
        name: "",
        message: "",
        isLoading: false
    });

    // --- Data Fetching Functions ---
    const fetchStocks = async () => {
        try {
            const response = await stockService.getAll();
            setStocks(response.data);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await storeService.getAll();
            setStores(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching stores:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await productService.getAll();
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll();
            setUsers(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStockTypes = async () => {
        try {
            const response = await stockTypeService.getAll();
            setStockTypes(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching stock types:', error);
        }
    };

    useEffect(() => {
        fetchStocks();
        fetchStores();
        fetchProducts();
        fetchUsers();
        fetchStockTypes();
    }, []);

// Add Store Form State
  const [addStoreForm, setAddStoreForm] = useState({
    storeName: "",
    province: "",
    channel: "",
    subChannel: "",
    message: "",
    isLoading: false,
  });

  // Edit Store State
  const [editingStore, setEditingStore] = useState(null);
  const [editStoreForm, setEditStoreForm] = useState({
    storeName: "",
    province: "",
    channel: "",
    subChannel: "",
    isLoading: false,
    message: "",
  });

  // Add Product Form State
  const [addProductForm, setAddProductForm] = useState({
    skuCode: "",
    skuName: "",
    ml: "",
    category: "",
    status: "",
    channelDistribution: "",
    pricingRsp: "",
    message: "",
    isLoading: false,
  });// Edit Product State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    skuCode: "",
    skuName: "",
    ml: "",
    category: "",
    status: "",
    channelDistribution: "",
    pricingRsp: "",
    isLoading: false,
    message: "",
  });const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // --- Icons (Simple SVGs) ---
  const Icons = {
    Dashboard: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        ></path>
      </svg>
    ),
    Stock: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
      </svg>
    ),
    Settings: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        ></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    ),
    ChevronDown: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    ),
    ChevronRight: () => (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
      </svg>
    ),
    Logout: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
      </svg>
    ),
    Menu: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    ),
    Close: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    ),
  };

  // --- Action Handlers ---

  const handleEditClick = (stock) => {
    setEditingStock(stock);
    setEditForm({
      stock_type: stock.stock_type,
      recent_stock: stock.recent_stock,
    });
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this stock entry? This action cannot be undone.")) {
      try {
        await stockService.delete(id);
        alert("Stock deleted successfully");
        // Refresh stocks
        const res = await stockService.getAll();
        setStocks(res.data);
      } catch (error) {
        console.error("Error deleting stock", error);
        alert("Failed to delete stock");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStock) return;
    try {
      await stockService.update(editingStock.id, {
        stock_type: editForm.stock_type,
        qty: parseInt(editForm.recent_stock),
      });

      setEditingStock(null);
      // Refresh stocks
      const res = await stockService.getAll();
      setStocks(res.data);
      alert("Stock updated successfully");
    } catch (error) {
      console.error("Error updating stock", error);
      alert("Failed to update stock: " + (error.response?.data?.message || error.message));
    }
  };

  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    if (!addStockForm.skuCode) {
      setAddStockForm((prev) => ({ ...prev, message: "Error: Please select a valid product." }));
      return;
    }

    setAddStockForm((prev) => ({ ...prev, isLoading: true, message: "" }));

    try {
      await stockService.create({
        store_id: addStockForm.storeId,
        sku_code: addStockForm.skuCode,
        stock_type: addStockForm.stockType,
        qty: parseInt(addStockForm.qty),
      });

      setAddStockForm((prev) => ({
        ...prev,
        message: "Stock added successfully!",
        qty: "",
        isLoading: false,
      }));

      // Refresh current stock
      const res = await stockService.getCurrent(addStockForm.storeId, addStockForm.skuCode);
      setAddStockForm((prev) => ({ ...prev, currentStock: res.data.current_stock }));
    } catch (error) {
      setAddStockForm((prev) => ({
        ...prev,
        message: "Error adding stock: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  const handleAddAccountSubmit = async (e) => {
    e.preventDefault();
    setAddAccountForm((prev) => ({ ...prev, isLoading: true, message: "" }));

    // --- Derived Data & Filters ---

    // Waterfall logic for Add Stock
    const uniqueProvincesAdd = useMemo(() => [...new Set(stores.map(s => s.province))].sort(), [stores]);
    const availableChannelsAdd = useMemo(() => stores.filter(s => s.province === addStockForm.province).map(s => s.channel).filter((v, i, a) => v && a.indexOf(v) === i).sort(), [stores, addStockForm.province]);
    const availableSubChannelsAdd = useMemo(() => stores.filter(s => s.province === addStockForm.province && s.channel === addStockForm.channel).map(s => s.sub_channel).filter((v, i, a) => v && a.indexOf(v) === i).sort(), [stores, addStockForm.province, addStockForm.channel]);
    const availableStoresAdd = useMemo(() => stores.filter(s => s.province === addStockForm.province && s.channel === addStockForm.channel && s.sub_channel === addStockForm.subChannel).sort((a, b) => a.store_name.localeCompare(b.store_name)), [stores, addStockForm.province, addStockForm.channel, addStockForm.subChannel]);

    // Store Filter
    const filteredStores = useMemo(() => stores.filter(store => store.store_name.toLowerCase().includes(storeSearchTerm.toLowerCase())), [stores, storeSearchTerm]);

    // Product Filter
    const filteredProducts = useMemo(() => products.filter(product => product.sku_name.toLowerCase().includes(productSearchTerm.toLowerCase()) || product.sku_code.toLowerCase().includes(productSearchTerm.toLowerCase())), [products, productSearchTerm]);

    // Dashboard Filters
    const uniqueProvinces = useMemo(() => [...new Set(stores.map(s => s.province))].filter(Boolean), [stores]);
    const uniqueChannels = useMemo(() => [...new Set(stores.map(s => s.channel))].filter(Boolean), [stores]);
    const uniqueSubChannels = useMemo(() => [...new Set(stores.map(s => s.sub_channel))].filter(Boolean), [stores]);
    const uniqueSkus = useMemo(() => [...new Set(stocks.map(s => s.sku_code))].filter(Boolean), [stocks]);
    const skuFilterOptions = useMemo(() => {
        return products.map(p => ({
            value: p.sku_code,
            label: `${p.sku_code} - ${p.sku_name}`
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [products]);
    const uniqueStatuses = useMemo(() => {
        // Combine statuses from actual data and predefined types
        const dataStatuses = stocks.map(s => s.stock_type);
        const definedStatuses = stockTypes.length > 0 
            ? stockTypes.map(st => st.name) 
            : ['Penjualan', 'Pengiriman', 'Retur', 'Tester', 'Transfer Barang', 'Adjustment', 'Barang Masuk'];
            
        return [...new Set([...dataStatuses, ...definedStatuses])].filter(Boolean).sort();
    }, [stockTypes, stocks]);

    const filteredStocks = useMemo(() => {
        return stocks.filter(stock => {
            const stockDate = new Date(stock.created_at);
            if (filterDateStart && stockDate < new Date(filterDateStart)) return false;
            if (filterDateEnd) {
                const endDate = new Date(filterDateEnd);
                endDate.setHours(23, 59, 59, 999);
                if (stockDate > endDate) return false;
            }
            if (filterProvince && stock.store?.province !== filterProvince) return false;
            if (filterChannel && stock.store?.channel !== filterChannel) return false;
            if (filterSubChannel && stock.store?.sub_channel !== filterSubChannel) return false;
            if (filterStore && stock.store?.id !== parseInt(filterStore)) return false;
            if (filterSku && stock.sku_code !== filterSku) return false;
            if (filterStatus && stock.stock_type !== filterStatus) return false;
            return true;
        }).sort((a, b) => {
            if (sortConfig.key === 'real_stock') {
                return sortConfig.direction === 'asc' ? a.real_stock - b.real_stock : b.real_stock - a.real_stock;
            }
            if (sortConfig.key === 'recent_stock') {
                return sortConfig.direction === 'asc' ? a.recent_stock - b.recent_stock : b.recent_stock - a.recent_stock;
            }
            if (sortConfig.key === 'created_at') {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
            }
            return 0;
        });
    }, [stocks, filterDateStart, filterDateEnd, filterProvince, filterChannel, filterSubChannel, filterStore, filterSku, filterStatus, sortConfig]);

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return 'â†•';
        return sortConfig.direction === 'asc' ? 'â†‘' : 'â†“';
    };
    try {
      await userService.create({
        name: addAccountForm.name,
        email: addAccountForm.email,
        password: addAccountForm.password,
        role: addAccountForm.role,
        store_id: null,
      });

      setAddAccountForm({
        name: "",
        email: "",
        password: "",
        role: "staff",
        storeId: "",
        message: "User account created successfully!",
        isLoading: false,
      });
    } catch (error) {
      setAddAccountForm((prev) => ({
        ...prev,
        message: "Error creating account: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    setAddStoreForm((prev) => ({ ...prev, isLoading: true, message: "" }));

    try {
      const res = await storeService.create({
        store_name: addStoreForm.storeName,
        province: addStoreForm.province,
        channel: addStoreForm.channel,
        sub_channel: addStoreForm.subChannel,
      });

      setStores((prev) => [...prev, res.data.data]);
      setAddStoreForm({
        storeName: "",
        province: "",
        channel: "",
        subChannel: "",
        message: "Store created successfully!",
        isLoading: false,
      });
    } catch (error) {
      setAddStoreForm((prev) => ({
        ...prev,
        message: "Error creating store: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store? This action cannot be undone.")) return;

    try {
      await storeService.delete(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      alert("Error deleting store: " + (error.response?.data?.message || error.message));
    }
  };

  const openEditStoreModal = (store) => {
    setEditingStore(store);
    setEditStoreForm({
      storeName: store.store_name,
      province: store.province,
      channel: store.channel,
      subChannel: store.sub_channel,
      isLoading: false,
      message: "",
    });
  };

  const handleUpdateStoreSubmit = async (e) => {
    e.preventDefault();
    setEditStoreForm((prev) => ({ ...prev, isLoading: true, message: "" }));

    try {
      const res = await storeService.update(editingStore.id, {
        store_name: editStoreForm.storeName,
        province: editStoreForm.province,
        channel: editStoreForm.channel,
        sub_channel: editStoreForm.subChannel,
      });

      setStores((prev) => prev.map((s) => (s.id === editingStore.id ? res.data.data : s)));
      setEditingStore(null);
    } catch (error) {
      setEditStoreForm((prev) => ({
        ...prev,
        message: "Error updating store: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  // Stock Type Handlers
  const handleAddStockTypeSubmit = async (e) => {
    e.preventDefault();
    setAddStockTypeForm((prev) => ({ ...prev, isLoading: true, message: "" }));
    try {
      const res = await stockTypeService.create({
        name: addStockTypeForm.name,
      });
      setStockTypes((prev) => [...prev, res.data.data]);
      setAddStockTypeForm({ name: "", message: "Stock type created successfully!", isLoading: false });
    } catch (error) {
      setAddStockTypeForm((prev) => ({
        ...prev,
        message: "Error creating stock type: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  const handleDeleteStockType = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock type?")) return;
    try {
      await stockTypeService.delete(id);
      setStockTypes((prev) => prev.filter((st) => st.id !== id));
    } catch (error) {
      alert("Error deleting stock type: " + (error.response?.data?.message || error.message));
    }
  };
  const openEditStockTypeModal = (type) => {
    setEditingStockType(type);
    setEditStockTypeForm({
      name: type.name,
      message: "",
      isLoading: false,
    });
  };
  const handleUpdateStockTypeSubmit = async (e) => {
    e.preventDefault();
    setEditStockTypeForm((prev) => ({ ...prev, isLoading: true, message: "" }));
    try {
      const res = await stockTypeService.update(editingStockType.id, { name: editStockTypeForm.name });
      const updated = res.data.data || { id: editingStockType.id, name: editStockTypeForm.name };
      setStockTypes((prev) => prev.map((st) => (st.id === editingStockType.id ? updated : st)));
      setEditStockTypeForm({ name: "", message: "Stock type updated successfully!", isLoading: false });
      setEditingStockType(null);
    } catch (error) {
      setEditStockTypeForm((prev) => ({
        ...prev,
        message: "Error updating stock type: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  // Product Handlers
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setAddProductForm((prev) => ({ ...prev, isLoading: true, message: "" }));
    try {
      const res = await productService.create({
        sku_code: addProductForm.skuCode,
        sku_name: addProductForm.skuName,
        ml: addProductForm.ml,
        category: addProductForm.category,
        status: addProductForm.status,
        channel_distribution: addProductForm.channelDistribution,
        pricing_rsp: addProductForm.pricingRsp,
      });
      setProducts((prev) => [...prev, res.data.data]);
      setAddProductForm({
        skuCode: "",
        skuName: "",
        ml: "",
        category: "",
        status: "",
        channelDistribution: "",
        pricingRsp: "",
        message: "Product created successfully!",
        isLoading: false,
      });
    } catch (error) {
      setAddProductForm((prev) => ({
        ...prev,
        message: "Error creating product: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("Error deleting product: " + (error.response?.data?.message || error.message));
    }
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setEditProductForm({
      skuCode: product.sku_code,
      skuName: product.sku_name,
      ml: product.ml || "",
      category: product.category || "",
      status: product.status || "",
      channelDistribution: product.channel_distribution || "",
      pricingRsp: product.pricing_rsp || "",
      isLoading: false,
      message: "",
    });
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    setEditProductForm((prev) => ({ ...prev, isLoading: true, message: "" }));
    try {
      const res = await productService.update(editingProduct.id, {
        sku_code: editProductForm.skuCode,
        sku_name: editProductForm.skuName,
        ml: editProductForm.ml,
        category: editProductForm.category,
        status: editProductForm.status,
        channel_distribution: editProductForm.channelDistribution,
        pricing_rsp: editProductForm.pricingRsp,
      });

      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.data.data : p)));
      setEditingProduct(null);
    } catch (error) {
      setEditProductForm((prev) => ({
        ...prev,
        message: "Error updating product: " + (error.response?.data?.message || error.message),
        isLoading: false,
      }));
    }
  };

  // --- Derived Data & Filters ---

  // Waterfall logic for Add Stock
  const uniqueProvincesAdd = useMemo(() => [...new Set(stores.map((s) => s.province))].sort(), [stores]);
  const availableChannelsAdd = useMemo(
    () =>
      stores
        .filter((s) => s.province === addStockForm.province)
        .map((s) => s.channel)
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .sort(),
    [stores, addStockForm.province],
  );
  const availableSubChannelsAdd = useMemo(
    () =>
      stores
        .filter((s) => s.province === addStockForm.province && s.channel === addStockForm.channel)
        .map((s) => s.sub_channel)
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .sort(),
    [stores, addStockForm.province, addStockForm.channel],
  );
  const availableStoresAdd = useMemo(
    () => stores.filter((s) => s.province === addStockForm.province && s.channel === addStockForm.channel && s.sub_channel === addStockForm.subChannel).sort((a, b) => a.store_name.localeCompare(b.store_name)),
    [stores, addStockForm.province, addStockForm.channel, addStockForm.subChannel],
  );

  // Store Filter
  const filteredStores = useMemo(() => stores.filter((store) => store.store_name.toLowerCase().includes(storeSearchTerm.toLowerCase())), [stores, storeSearchTerm]);

  // Product Filter
  const filteredProducts = useMemo(
    () => products.filter((product) => product.sku_name.toLowerCase().includes(productSearchTerm.toLowerCase()) || product.sku_code.toLowerCase().includes(productSearchTerm.toLowerCase())),
    [products, productSearchTerm],
  );

  // Dashboard Filters
  const uniqueProvinces = useMemo(() => [...new Set(stores.map((s) => s.province))].filter(Boolean), [stores]);
  const uniqueChannels = useMemo(() => [...new Set(stores.map((s) => s.channel))].filter(Boolean), [stores]);
  const uniqueSubChannels = useMemo(() => [...new Set(stores.map((s) => s.sub_channel))].filter(Boolean), [stores]);
  const uniqueSkus = useMemo(() => [...new Set(stocks.map((s) => s.sku_code))].filter(Boolean), [stocks]);
  const uniqueStatuses = useMemo(() => {
    const statuses = stockTypes.length > 0 ? stockTypes.map((st) => st.name) : ["Penjualan", "Pengiriman", "Retur", "Tester", "Transfer Barang", "Request Stock"];
    return [...new Set(statuses)];
  }, [stockTypes]);
  const skuFilterOptions = uniqueSkus;

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const stockDate = new Date(stock.created_at);
      if (filterDateStart && stockDate < new Date(filterDateStart)) return false;
      if (filterDateEnd) {
        const endDate = new Date(filterDateEnd);
        endDate.setHours(23, 59, 59, 999);
        if (stockDate > endDate) return false;
      }
      if (filterProvince && stock.store?.province !== filterProvince) return false;
      if (filterChannel && stock.store?.channel !== filterChannel) return false;
      if (filterSubChannel && stock.store?.sub_channel !== filterSubChannel) return false;
      if (filterStore && stock.store?.id !== parseInt(filterStore)) return false;
      if (filterSku && stock.sku_code !== filterSku) return false;
      if (filterStatus && stock.stock_type !== filterStatus) return false;
      return true;
    });
  }, [stocks, filterDateStart, filterDateEnd, filterProvince, filterChannel, filterSubChannel, filterStore, filterSku, filterStatus]);

  // --- Render Components ---

  const handleApproveClick = (request) => {
        setSelectedRequest(request);
        // Get local date in YYYY-MM-DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        setApprovalForm({
            approved_qty: request.recent_stock, // Default to requested qty
            delivery_date: formattedDate,
            order_number: '',
            receipt_number: '',
            tracking_status: 'Being Package'
        });
        setIsApprovalModalOpen(true);
    };

    const handleApproveSubmit = async (e) => {
        e.preventDefault();
        try {
            await stockService.approve(selectedRequest.id, approvalForm);
            alert('Stock request approved successfully');
            setIsApprovalModalOpen(false);
            fetchStocks(); // Refresh data
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request');
        }
    };

    const handleTrackingClick = (request) => {
        setSelectedRequest(request);
        setTrackingForm({
            tracking_status: request.tracking_status || 'Being Package'
        });
        setIsTrackingModalOpen(true);
    };

    const handleTrackingSubmit = async (e) => {
        e.preventDefault();
        try {
            await stockService.tracking(selectedRequest.id, trackingForm);
            alert('Tracking status updated successfully');
            setIsTrackingModalOpen(false);
            fetchStocks(); // Refresh data
        } catch (error) {
            console.error('Error updating tracking:', error);
            alert('Failed to update tracking');
        }
    };

    const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStocks(),
        fetchStores(),
        fetchProducts(),
        fetchUsers(),
        fetchStockTypes()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderStockTable = (withActions = false) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              {withActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={withActions ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                  No stock data found.
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(stock.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.store?.store_name}
                    <div className="text-xs text-gray-500">{stock.store?.province}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.sku_code}
                    <div className="text-xs text-gray-500">{stock.product?.sku_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stock.stock_type === "Penjualan" ? "bg-blue-100 text-blue-800" : stock.stock_type === "Pengiriman" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {stock.stock_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{stock.recent_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{stock.real_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.user?.name}</td>
                  {withActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleEditClick(stock)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClick(stock.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

    const handleDownloadData = () => {
        const dataToDownload = filteredStocks;
        
        if (dataToDownload.length === 0) {
            alert("No data to download");
            return;
        }

        const headers = ["Date", "Store", "Province", "SKU Code", "SKU Name", "Type", "Qty", "Real Stock", "Reason", "User"];
        
        const csvRows = [
            headers.join(','),
            ...dataToDownload.map(stock => {
                const escape = (text) => `"${String(text || '').replace(/"/g, '""')}"`;
                return [
                    escape(new Date(stock.created_at).toLocaleString()),
                    escape(stock.store?.store_name),
                    escape(stock.store?.province),
                    escape(stock.sku_code),
                    escape(stock.product?.sku_name),
                    escape(stock.stock_type),
                    escape(stock.recent_stock),
                    escape(stock.real_stock),
                    escape(stock.reason),
                    escape(stock.user?.name)
                ].join(',');
            })
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `stock_data_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div>
                        {/* Filters (Compact) */}
                        <div className="bg-white p-4 rounded-lg shadow mb-6">
                            <h3 className="font-bold text-gray-700 mb-2">Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                                <input type="date" className="border p-2 rounded" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
                                <input type="date" className="border p-2 rounded" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
                                <SearchableDropdown 
                                    options={uniqueProvinces} 
                                    value={filterProvince} 
                                    onChange={setFilterProvince} 
                                    placeholder="All Provinces" 
                                />
                                <SearchableDropdown 
                                    options={stores} 
                                    value={filterStore} 
                                    onChange={setFilterStore} 
                                    placeholder="All Stores" 
                                    labelKey="store_name" 
                                    valueKey="id" 
                                />
                                <SearchableDropdown 
                                    options={skuFilterOptions} 
                                    value={filterSku} 
                                    onChange={setFilterSku} 
                                    placeholder="All SKUs" 
                                />
                                <SearchableDropdown 
                                    options={uniqueStatuses} 
                                    value={filterStatus} 
                                    onChange={setFilterStatus} 
                                    placeholder="All Types" 
                                />
                            </div>
                            <div className="flex justify-end mt-2 space-x-2">
                                <button onClick={handleRefresh} disabled={isRefreshing} className={`bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isRefreshing ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : null}
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                                <button onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); setFilterProvince(''); setFilterStore(''); setFilterSku(''); setFilterStatus(''); setSortConfig({ key: 'created_at', direction: 'desc' }); }} className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-red-100 transition-colors">Clear Filters</button>
                                <button onClick={handleDownloadData} className="bg-[#1B4D3E] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[#143d30] transition-colors flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Download Data
                                </button>
                            </div>
                        </div>
                        {renderStockTable(false)}
                    </div>
                );
            case 'request-stock':
                return (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Stock Requests</h3>
                            <button onClick={handleRefresh} className="text-sm text-gray-600 hover:text-gray-900">Refresh</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req Qty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stocks.filter(s => s.stock_type === 'Request Stock').length === 0 ? (
                                        <tr><td colSpan="8" className="px-6 py-4 text-center text-gray-500">No stock requests found.</td></tr>
                                    ) : (
                                        stocks.filter(s => s.stock_type === 'Request Stock').map((stock) => (
                                            <tr key={stock.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(stock.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.store?.store_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.sku_code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.recent_stock}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.user?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        stock.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                                        stock.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {stock.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.tracking_status || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {stock.status !== 'Approved' ? (
                                                        <button onClick={() => handleApproveClick(stock)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded mr-2">
                                                            Approve
                                                        </button>
                                                    ) : (
                                                        stock.tracking_status === 'Delivered' ? (
                                                            <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded cursor-not-allowed">
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <button onClick={() => handleTrackingClick(stock)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded">
                                                                Update Tracking
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'edit-stock':
                return (
                    <div>
                        <div className="mb-4 flex justify-between items-center">
                             <h3 className="font-bold text-gray-700">Manage Stock Entries</h3>
                        </div>
                        {renderStockTable(true)}
                    </div>
                );
            case 'request-stock':
                return (
                    <div>
                        <div className="mb-4 flex justify-between items-center">
                             <h3 className="font-bold text-gray-700">Requested Stocks</h3>
                             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                               {stocks.filter(s => s.stock_type === 'Request Stock').length} Requests
                             </span>
                        </div>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Qty</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {stocks.filter(s => s.stock_type === 'Request Stock').length === 0 ? (
                                  <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">No requests found.</td>
                                  </tr>
                                ) : (
                                  stocks
                                    .filter(s => s.stock_type === 'Request Stock')
                                    .map((stock) => (
                                      <tr key={stock.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(stock.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {stock.store?.store_name}
                                          <div className="text-xs text-gray-500">{stock.store?.province}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          {stock.sku_code}
                                          <div className="text-xs text-gray-500">{stock.product?.sku_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{stock.recent_stock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.user?.name}</td>
                                      </tr>
                                    ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                    </div>
                );
            case 'add-stock':
                return (
                    <div className="bg-white rounded-lg shadow p-8 max-w-4xl mx-auto">
                        <h2 className="text-xl font-bold mb-6 text-[#1B4D3E]">Add New Stock Entry</h2>
                        {addStockForm.message && <div className={`mb-4 p-3 rounded ${addStockForm.message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{addStockForm.message}</div>}
                        <form onSubmit={handleAddStockSubmit} className="space-y-6">
                             {/* Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                                <div><label className="block text-sm font-medium">Province</label><select className="w-full border p-2 rounded" value={addStockForm.province} onChange={e => setAddStockForm({...addStockForm, province: e.target.value, channel: '', subChannel: '', storeId: ''})} required><option value="">Select Province</option>{uniqueProvincesAdd.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                <div><label className="block text-sm font-medium">Channel</label><select className="w-full border p-2 rounded" value={addStockForm.channel} onChange={e => setAddStockForm({...addStockForm, channel: e.target.value, subChannel: '', storeId: ''})} disabled={!addStockForm.province} required><option value="">Select Channel</option>{availableChannelsAdd.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label className="block text-sm font-medium">Sub Channel</label><select className="w-full border p-2 rounded" value={addStockForm.subChannel} onChange={e => setAddStockForm({...addStockForm, subChannel: e.target.value, storeId: ''})} disabled={!addStockForm.channel} required><option value="">Select Sub Channel</option>{availableSubChannelsAdd.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label className="block text-sm font-medium">Store</label><select className="w-full border p-2 rounded" value={addStockForm.storeId} onChange={e => setAddStockForm({...addStockForm, storeId: e.target.value})} disabled={!addStockForm.subChannel} required><option value="">Select Store</option>{availableStoresAdd.map(s => <option key={s.id} value={s.id}>{s.store_name}</option>)}</select></div>
                            </div>
                            {/* Product & Stock */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Stock Type</label>
                                    <select 
                                        className="w-full border p-2 rounded" 
                                        value={addStockForm.stockType} 
                                        onChange={e => setAddStockForm({...addStockForm, stockType: e.target.value})} 
                                        required
                                    >
                                        {uniqueStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium">Search Product</label>
                                        <input type="text" className="w-full border p-2 rounded" placeholder="Search SKU Name..." value={addStockForm.skuSearchTerm} onChange={e => setAddStockForm({...addStockForm, skuSearchTerm: e.target.value, skuCode: '', isSkuDropdownOpen: true})} onFocus={() => setAddStockForm(prev => ({...prev, isSkuDropdownOpen: true}))} onBlur={() => setTimeout(() => setAddStockForm(prev => ({...prev, isSkuDropdownOpen: false})), 200)} />
                                        {addStockForm.isSkuDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                                                {products.filter(p => p.sku_name.toLowerCase().includes(addStockForm.skuSearchTerm.toLowerCase())).map(p => (
                                                    <div key={p.sku_code} className="p-2 hover:bg-[#1B4D3E] hover:text-white cursor-pointer" onMouseDown={() => setAddStockForm(prev => ({...prev, skuCode: p.sku_code, skuSearchTerm: p.sku_name, isSkuDropdownOpen: false}))}>{p.sku_name}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div><label className="block text-sm font-medium">SKU Code</label><input type="text" className="w-full border p-2 rounded bg-gray-100" value={addStockForm.skuCode} disabled /></div>
                                    <div><label className="block text-sm font-medium">Current Stock</label><input type="text" className="w-full border p-2 rounded bg-gray-100" value={addStockForm.currentStock} disabled /></div>
                                    <div><label className="block text-sm font-medium">Qty (In/Out)</label><input type="number" className="w-full border p-2 rounded" value={addStockForm.qty} onChange={e => setAddStockForm({...addStockForm, qty: e.target.value})} required min="1" /></div>
                                </div>
                            </div>
                            <button type="submit" disabled={addStockForm.isLoading} className="w-full bg-[#1B4D3E] text-white py-3 rounded hover:bg-[#143d30] font-bold">{addStockForm.isLoading ? 'Saving...' : 'Submit Stock Entry'}</button>
                        </form>
                    </div>
                );
            case 'change-password':
                return (
                    <div className="bg-white p-6 rounded-lg shadow max-w-md">
                        <h2 className="text-xl font-bold mb-4">Change Password</h2>
                        <form className="space-y-4">
                            <div><label className="block text-sm font-medium">Current Password</label><input type="password" class="w-full border p-2 rounded" /></div>
                            <div><label className="block text-sm font-medium">New Password</label><input type="password" class="w-full border p-2 rounded" /></div>
                            <button className="bg-[#1B4D3E] text-white px-4 py-2 rounded">Update</button>
                        </form>
                    </div>
                );
            case 'add-account':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column: Form */}
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#1B4D3E] mb-6 pb-2 border-b border-gray-100">Add New User Account</h3>
                            {addAccountForm.message && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${addAccountForm.message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {addAccountForm.message}
                                </div>
                            )}
                            <form onSubmit={handleAddAccountSubmit} className="space-y-5">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addAccountForm.name} onChange={e => setAddAccountForm({...addAccountForm, name: e.target.value})} required placeholder="e.g. John Doe" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addAccountForm.email} onChange={e => setAddAccountForm({...addAccountForm, email: e.target.value})} required placeholder="e.g. john@example.com" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addAccountForm.password} onChange={e => setAddAccountForm({...addAccountForm, password: e.target.value})} required placeholder="Min. 8 characters" minLength="8" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addAccountForm.role} onChange={e => setAddAccountForm({...addAccountForm, role: e.target.value})}><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
                                
                                {/* Assign Store Removed as per request */}
                                
                                <button type="submit" disabled={addAccountForm.isLoading} className="w-full bg-[#1B4D3E] text-white py-3 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">{addAccountForm.isLoading ? 'Creating Account...' : 'Create Account'}</button>
                            </form>
                        </div>

                        {/* Right Column: User List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">Existing Users</h3>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{users.length} Users</span>
                            </div>
                            <div className="overflow-auto flex-1 p-0">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {users.length === 0 ? (
                                            <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-sm">No users found.</td></tr>
                                        ) : (
                                            users.map((user, index) => (
                                                <tr key={user.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'add-store':
                return (
                    <div className="w-full mx-auto">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#1B4D3E] mb-6 pb-2 border-b border-gray-100">Add New Store</h3>
                            {addStoreForm.message && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${addStoreForm.message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {addStoreForm.message}
                                </div>
                            )}
                            <form onSubmit={handleAddStoreSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Province</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addStoreForm.province} onChange={e => setAddStoreForm({...addStoreForm, province: e.target.value})} required placeholder="e.g. DKI Jakarta" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Channel</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addStoreForm.channel} onChange={e => setAddStoreForm({...addStoreForm, channel: e.target.value})} required placeholder="e.g. Department Store" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sub Channel</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addStoreForm.subChannel} onChange={e => setAddStoreForm({...addStoreForm, subChannel: e.target.value})} required placeholder="e.g. Metro" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addStoreForm.storeName} onChange={e => setAddStoreForm({...addStoreForm, storeName: e.target.value})} required placeholder="e.g. Store Jakarta Pusat" /></div>
                                
                                <div className="md:col-span-2 mt-4">
                                    <button type="submit" disabled={addStoreForm.isLoading} className="w-full bg-[#1B4D3E] text-white py-3 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">{addStoreForm.isLoading ? 'Creating Store...' : 'Create Store'}</button>
                                </div>
                            </form>
                        </div>

                        {/* Stores List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-8">
                            <div className="p-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="text-lg font-bold text-gray-800">Existing Stores</h3>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <input 
                                            type="text" 
                                            placeholder="Search store name..." 
                                            value={storeSearchTerm}
                                            onChange={(e) => setStoreSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors text-sm"
                                        />
                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </div>
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{filteredStores.length} Stores</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Store Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Province</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Channel</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sub Channel</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredStores.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">No stores found.</td></tr>
                                        ) : (
                                            filteredStores.map((store, index) => (
                                                <tr key={store.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.store_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.province}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.channel}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.sub_channel}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        <button onClick={() => openEditStoreModal(store)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                                                        <button onClick={() => handleDeleteStore(store.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Edit Store Modal */}
                        {editingStore && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className="text-xl font-bold text-gray-800">Edit Store</h3>
                                        <button onClick={() => setEditingStore(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                            <Icons.Close />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {editStoreForm.message && (
                                            <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${editStoreForm.message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                {editStoreForm.message}
                                            </div>
                                        )}
                                        <form onSubmit={handleUpdateStoreSubmit} className="space-y-4">
                                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Province</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={editStoreForm.province} onChange={e => setEditStoreForm({...editStoreForm, province: e.target.value})} required /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Channel</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={editStoreForm.channel} onChange={e => setEditStoreForm({...editStoreForm, channel: e.target.value})} required /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sub Channel</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={editStoreForm.subChannel} onChange={e => setEditStoreForm({...editStoreForm, subChannel: e.target.value})} required /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={editStoreForm.storeName} onChange={e => setEditStoreForm({...editStoreForm, storeName: e.target.value})} required /></div>
                                            
                                            <div className="pt-4 flex gap-3">
                                                <button type="button" onClick={() => setEditingStore(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                                                <button type="submit" disabled={editStoreForm.isLoading} className="flex-1 bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">{editStoreForm.isLoading ? 'Updating...' : 'Update Store'}</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'add-status-stock':
                return (
                    <div className="w-full mx-auto">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#1B4D3E] mb-6 pb-2 border-b border-gray-100">Add Stock Type</h3>
                            {addStockTypeForm.message && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${addStockTypeForm.message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {addStockTypeForm.message}
                                </div>
                            )}
                            <form onSubmit={handleAddStockTypeSubmit} className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" 
                                        value={addStockTypeForm.name} 
                                        onChange={e => setAddStockTypeForm({...addStockTypeForm, name: e.target.value})} 
                                        required 
                                        placeholder="e.g. Broken, Expired" 
                                    />
                                </div>
                                
                                <div className="mt-4">
                                    <button type="submit" disabled={addStockTypeForm.isLoading} className="w-full bg-[#1B4D3E] text-white py-3 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">
                                        {addStockTypeForm.isLoading ? 'Creating Status...' : 'Create Status'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Stock Types List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-8">
                            <div className="p-6 bg-white border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800">Existing Stock Types</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {stockTypes.length === 0 ? (
                                            <tr><td colSpan="2" className="px-6 py-8 text-center text-gray-500 text-sm">No stock types found.</td></tr>
                                        ) : (
                                            stockTypes.map((type, index) => (
                                                <tr key={type.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                          <button onClick={() => openEditStockTypeModal(type)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                                                          <button onClick={() => handleDeleteStockType(type.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {editingStockType && (
                              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-xl font-bold text-gray-800">Edit Stock Type</h3>
                                    <button onClick={() => setEditingStockType(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                      <Icons.Close />
                                    </button>
                                  </div>
                                  <div className="p-6">
                                    {editStockTypeForm.message && (
                                      <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${editStockTypeForm.message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {editStockTypeForm.message}
                                      </div>
                                    )}
                                    <form onSubmit={handleUpdateStockTypeSubmit} className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Name</label>
                                        <input
                                          type="text"
                                          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                                          value={editStockTypeForm.name}
                                          onChange={(e) => setEditStockTypeForm({ ...editStockTypeForm, name: e.target.value })}
                                          required
                                        />
                                      </div>
                                      <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setEditingStockType(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                          Cancel
                                        </button>
                                        <button type="submit" disabled={editStockTypeForm.isLoading} className="flex-1 bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">
                                          {editStockTypeForm.isLoading ? "Updating..." : "Update"}
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                    </div>
                );
            case 'add-products':
                return (
                    <div className="w-full mx-auto">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#1B4D3E] mb-6 pb-2 border-b border-gray-100">Add New Product</h3>
                            {addProductForm.message && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${addProductForm.message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {addProductForm.message}
                                </div>
                            )}
                            <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU Code</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addProductForm.skuCode} onChange={e => setAddProductForm({...addProductForm, skuCode: e.target.value})} required placeholder="e.g. AMS300QUI" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU Name</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addProductForm.skuName} onChange={e => setAddProductForm({...addProductForm, skuName: e.target.value})} required placeholder="e.g. SAFF & Co. HOME FRAGRANCE..." /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">ML</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addProductForm.ml} onChange={e => setAddProductForm({...addProductForm, ml: e.target.value})} placeholder="e.g. 300 ml" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addProductForm.category} onChange={e => setAddProductForm({...addProductForm, category: e.target.value})} placeholder="e.g. SINGLE - AMBIENCE MIST" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addProductForm.status} onChange={e => setAddProductForm({...addProductForm, status: e.target.value})} placeholder="e.g. Will be Launch" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Channel Distribution</label><input type="text" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addProductForm.channelDistribution} onChange={e => setAddProductForm({...addProductForm, channelDistribution: e.target.value})} placeholder="e.g. All Channels" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Pricing RSP</label><input type="number" step="0.01" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors" value={addProductForm.pricingRsp} onChange={e => setAddProductForm({...addProductForm, pricingRsp: e.target.value})} placeholder="e.g. 0.00" /></div>
                                
                                <div className="md:col-span-2 mt-4">
                                    <button type="submit" disabled={addProductForm.isLoading} className="w-full bg-[#1B4D3E] text-white py-3 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">{addProductForm.isLoading ? 'Creating Product...' : 'Create Product'}</button>
                                </div>
                            </form>
                        </div>

                        {/* Products List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-8">
                            <div className="p-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h3 className="text-lg font-bold text-gray-800">Existing Products</h3>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <input 
                                            type="text" 
                                            placeholder="Search product..." 
                                            value={productSearchTerm}
                                            onChange={(e) => setProductSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors text-sm"
                                        />
                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </div>
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{filteredProducts.length} Products</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pricing</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredProducts.length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">No products found.</td></tr>
                                        ) : (
                                            filteredProducts.map((product, index) => (
                                                <tr key={product.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku_code}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={product.sku_name}>{product.sku_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.pricing_rsp ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(product.pricing_rsp) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        <button onClick={() => openEditProductModal(product)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Edit</button>
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            default: return <div>Select a menu item</div>;
        }
    };
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-72" : "w-0"} bg-linear-to-b from-[#1B4D3E] to-[#0D2921] text-white flex flex-col shadow-2xl z-20 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center h-20 bg-[#1B4D3E]/50 backdrop-blur-sm">
          <h1 className="text-2xl font-bold tracking-wider flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-lg shadow-inner">
              <Icons.Stock />
            </span>
            <span className="bg-clip-text text-transparent bg-linear-to-r from-white to-gray-300">Stock Area</span>
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="text-white/70 hover:text-white lg:hidden transition-colors">
            <Icons.Close />
          </button>
        </div>

        <nav className="flex-1 p-5 space-y-4 overflow-y-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group ${activeTab === "dashboard" ? "bg-white text-[#1B4D3E] font-bold shadow-lg transform scale-[1.02]" : "hover:bg-white/10 hover:translate-x-1"}`}
          >
            <Icons.Dashboard />
            <span>Dashboard</span>
          </button>

          {/* Stock Menu */}
          <div className="pt-2">
            <p className="px-4 text-xs font-bold text-gray-400/80 uppercase tracking-widest mb-3">Inventory</p>
            <button
              onClick={() => setIsStockMenuOpen(!isStockMenuOpen)}
              className={`w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 flex justify-between items-center group ${isStockMenuOpen ? "bg-white/5" : ""}`}
            >
              <span className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                <Icons.Stock />
                <span>Stock Management</span>
              </span>
              <span className="text-gray-400 group-hover:text-white transition-colors">{isStockMenuOpen ? <Icons.ChevronDown /> : <Icons.ChevronRight />}</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isStockMenuOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 space-y-1 border-l-2 border-white/10 pl-3">
                <button
                  onClick={() => setActiveTab("add-stock")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "add-stock" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Add Stock
                </button>
                <button
                  onClick={() => setActiveTab("edit-stock")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "edit-stock" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Edit Stock
                </button>
                  <button
                    onClick={() => setActiveTab("request-stock")}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "request-stock" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Request Stock
                  </button>
              </div>
            </div>
          </div>

          {/* Settings Menu */}
          <div className="pt-2">
            <p className="px-4 text-xs font-bold text-gray-400/80 uppercase tracking-widest mb-3">System</p>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 flex justify-between items-center group ${isSettingsOpen ? "bg-white/5" : ""}`}
            >
              <span className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                <Icons.Settings />
                <span>Settings</span>
              </span>
              <span className="text-gray-400 group-hover:text-white transition-colors">{isSettingsOpen ? <Icons.ChevronDown /> : <Icons.ChevronRight />}</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isSettingsOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
              <div className="ml-4 space-y-1 border-l-2 border-white/10 pl-3">
                <button
                  onClick={() => setActiveTab("change-password")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "change-password" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Change Password
                </button>
                <button
                  onClick={() => setActiveTab("add-account")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "add-account" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Add Account
                </button>
                <button
                  onClick={() => setActiveTab("add-store")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "add-store" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Add Store
                </button>
                <button
                  onClick={() => setActiveTab("add-status-stock")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "add-status-stock" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Add Status Stock
                </button>
                <button
                  onClick={() => setActiveTab("add-products")}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${activeTab === "add-products" ? "text-[#4ade80] font-bold bg-white/10 translate-x-1" : "text-gray-300 hover:text-white hover:bg-white/5 hover:translate-x-1"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span> Add Products
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#143d30]">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 text-sm font-medium">
            <Icons.Logout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 z-10 flex items-center gap-4 border-b sticky top-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl hover:bg-[#1B4D3E]/10 text-[#1B4D3E] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 active:scale-95">
            <div className={`transform transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : "rotate-0"}`}>
              <Icons.Menu />
            </div>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 capitalize flex items-center gap-2 tracking-tight">{activeTab.replace(/-/g, " ")}</h2>
        </header>
        <div className="flex-1 overflow-auto p-6">{renderContent()}</div>

        {/* Edit Modal */}
        {editingStock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Edit Stock Entry</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Stock Type</label>
                  <select className="w-full border p-2 rounded" value={editForm.stock_type} onChange={(e) => setEditForm({ ...editForm, stock_type: e.target.value })}>
                    <option value="Penjualan">Penjualan</option>
                    <option value="Pengiriman">Pengiriman</option>
                    <option value="Retur">Retur</option>
                    <option value="Tester">Tester</option>
                    <option value="Transfer Barang">Transfer Barang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Quantity (In/Out)</label>
                  <input type="number" className="w-full border p-2 rounded" value={editForm.recent_stock} onChange={(e) => setEditForm({ ...editForm, recent_stock: e.target.value })} />
                  <p className="text-xs text-gray-500">Recalculates real stock.</p>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setEditingStock(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} className="px-4 py-2 bg-[#1B4D3E] text-white rounded">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Icons.Close />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[80vh]">
                {editProductForm.message && (
                  <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${editProductForm.message.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                    {editProductForm.message}
                  </div>
                )}
                <form onSubmit={handleUpdateProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                      value={editProductForm.skuCode}
                      onChange={(e) => setEditProductForm({ ...editProductForm, skuCode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                      value={editProductForm.skuName}
                      onChange={(e) => setEditProductForm({ ...editProductForm, skuName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                      value={editProductForm.category}
                      onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pricing RSP</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                      value={editProductForm.pricingRsp}
                      onChange={(e) => setEditProductForm({ ...editProductForm, pricingRsp: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ML</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                      value={editProductForm.ml}
                      onChange={(e) => setEditProductForm({ ...editProductForm, ml: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                      value={editProductForm.status}
                      onChange={(e) => setEditProductForm({ ...editProductForm, status: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel Distribution</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] transition-colors"
                      value={editProductForm.channelDistribution}
                      onChange={(e) => setEditProductForm({ ...editProductForm, channelDistribution: e.target.value })}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={editProductForm.isLoading} className="flex-1 bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">
                      {editProductForm.isLoading ? "Updating..." : "Update Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {isApprovalModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="bg-[#1B4D3E] px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Approve Request</h3>
                        <button onClick={() => setIsApprovalModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <Icons.Close />
                        </button>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleApproveSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Qty</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border border-gray-300 p-2.5 rounded-lg"
                                    value={approvalForm.approved_qty}
                                    onChange={(e) => setApprovalForm({ ...approvalForm, approved_qty: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-gray-300 p-2.5 rounded-lg"
                                    value={approvalForm.delivery_date}
                                    onChange={(e) => setApprovalForm({ ...approvalForm, delivery_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 p-2.5 rounded-lg"
                                    value={approvalForm.order_number}
                                    onChange={(e) => setApprovalForm({ ...approvalForm, order_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number (Resi)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 p-2.5 rounded-lg"
                                    value={approvalForm.receipt_number}
                                    onChange={(e) => setApprovalForm({ ...approvalForm, receipt_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Status</label>
                                <select
                                    className="w-full border border-gray-300 p-2.5 rounded-lg"
                                    value={approvalForm.tracking_status}
                                    onChange={(e) => setApprovalForm({ ...approvalForm, tracking_status: e.target.value })}
                                >
                                    <option value="Being Package">Being Package</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Being Delivered">Being Delivered</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsApprovalModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">
                                    Approve
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* Tracking Modal */}
        {isTrackingModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="bg-[#1B4D3E] px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Update Tracking</h3>
                        <button onClick={() => setIsTrackingModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <Icons.Close />
                        </button>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleTrackingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Status</label>
                                <select
                                    className="w-full border border-gray-300 p-2.5 rounded-lg"
                                    value={trackingForm.tracking_status}
                                    onChange={(e) => setTrackingForm({ ...trackingForm, tracking_status: e.target.value })}
                                >
                                    <option value="Being Package">Being Package</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Being Delivered">Being Delivered</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsTrackingModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-[#1B4D3E] text-white px-4 py-2 rounded-lg hover:bg-[#143d30] font-bold shadow-lg shadow-[#1B4D3E]/20 transition-all active:scale-[0.98]">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
