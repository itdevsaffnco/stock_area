import { useState, useEffect } from 'react';
import { storeService, productService, stockTypeService, stockService } from '../services';
import { useNavigate } from 'react-router-dom';
import SearchableDropdown from '../components/SearchableDropdown';

function StaffDashboard() {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    
    // Form States
    const [province, setProvince] = useState('');
    const [subChannel, setSubChannel] = useState('');
    const [channel, setChannel] = useState('');
    const [storeId, setStoreId] = useState('');
    
    // Destination Store States
    const [destProvince, setDestProvince] = useState('');
    const [destSubChannel, setDestSubChannel] = useState('');
    const [destChannel, setDestChannel] = useState('');
    const [destStoreId, setDestStoreId] = useState('');
    
    const [stockType, setStockType] = useState('');
    const [stockTypes, setStockTypes] = useState([]); // Add stockTypes state
    const [skuCode, setSkuCode] = useState('');
    const [skuSearchTerm, setSkuSearchTerm] = useState('');
    const [isSkuDropdownOpen, setIsSkuDropdownOpen] = useState(false);
    const [isSkuCodeDropdownOpen, setIsSkuCodeDropdownOpen] = useState(false);
    const [currentStock, setCurrentStock] = useState(0);
    const [qty, setQty] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Fetch Master Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storesRes, productsRes, stockTypesRes] = await Promise.all([
                    storeService.getAll(),
                    productService.getAll(),
                    stockTypeService.getAll(),
                ]);
                setStores(storesRes.data);
                setProducts(productsRes.data);
                setStockTypes(stockTypesRes.data.data || stockTypesRes.data);
            } catch (error) {
                console.error('Error fetching data', error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };
        fetchData();
    }, [navigate]);

  // Destination Store States
  const [destProvince, setDestProvince] = useState("");
  const [destSubChannel, setDestSubChannel] = useState("");
  const [destChannel, setDestChannel] = useState("");
  const [destStoreId, setDestStoreId] = useState("");

  const [stockType, setStockType] = useState("Penjualan");
  const [skuCode, setSkuCode] = useState("");
  const [skuSearchTerm, setSkuSearchTerm] = useState("");
  const [isSkuDropdownOpen, setIsSkuDropdownOpen] = useState(false);
  const [isSkuCodeDropdownOpen, setIsSkuCodeDropdownOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(0);
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch Master Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, productsRes] = await Promise.all([api.get("/stores"), api.get("/products")]);
        setStores(Array.isArray(storesRes.data) ? storesRes.data : Array.isArray(storesRes.data?.data) ? storesRes.data.data : []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : Array.isArray(productsRes.data?.data) ? productsRes.data.data : []);
      } catch (error) {
        console.error("Error fetching data", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };
    fetchData();
  }, [navigate]);

  // Derived Lists for Waterfall (Province -> Channel -> Sub Channel -> Store)
  const uniqueProvinces = [...new Set(stores.map((s) => s.province))].sort();

  // 1. Channel depends on Province
  const availableChannels = stores
    .filter((s) => s.province === province)
    .map((s) => s.channel)
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .sort();

  // 2. Sub Channel depends on Province AND Channel
  const availableSubChannels = stores
    .filter((s) => s.province === province && s.channel === channel)
    .map((s) => s.sub_channel)
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .sort();

    // Fetch Current Stock
    useEffect(() => {
        if (storeId && skuCode) {
            const fetchStock = async () => {
                try {
                    const res = await stockService.getCurrent(storeId, skuCode);
                    setCurrentStock(res.data.current_stock);
                } catch (error) {
                    console.error('Error fetching stock', error);
                }
            };
            fetchStock();
        } else {
            setCurrentStock(0);
        }
    }, [storeId, skuCode]);

    const handleDownloadOpname = async () => {
        if (!storeId) {
            setMessage('Error: Please select a store first.');
            return;
        }

        try {
            const response = await stockService.downloadOpnameTemplate(storeId);

            // Extract filename from header if possible, or generate one
            const contentDisposition = response.headers['content-disposition'];
            let filename = `stock_opname_${storeId}_${new Date().toISOString().slice(0, 10)}.csv`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading opname template', error);
            setMessage('Error downloading template: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!skuCode) {
            setMessage('Error: Please select a valid product from the list.');
            return;
        }

  const availableDestSubChannels = stores
    .filter((s) => s.province === destProvince && s.channel === destChannel)
    .map((s) => s.sub_channel)
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .sort();

  const availableDestStores = stores
    .filter((s) => s.province === destProvince && s.channel === destChannel && s.sub_channel === destSubChannel)
    // Exclude current store from destination options
    .filter((s) => s.id !== parseInt(storeId))
    .sort((a, b) => a.store_name.localeCompare(b.store_name));

  // Fetch Current Stock
  useEffect(() => {
    if (storeId && skuCode) {
      const fetchStock = async () => {
        try {
            await stockService.create({
                store_id: storeId,
                sku_code: skuCode,
                stock_type: stockType,
                qty: parseInt(qty),
                reason: stockType === 'Retur' ? reason : null,
                destination_store_id: stockType === 'Transfer Barang' ? destStoreId : null
            });
            setShowSuccessModal(true);
            setMessage('');
            setQty('');
            setReason('');
            setDestProvince('');
            setDestChannel('');
            setDestSubChannel('');
            setDestStoreId('');
            // Refresh current stock
            const res = await stockService.getCurrent(storeId, skuCode);
            setCurrentStock(res.data.current_stock);
        } catch (error) {
          console.error("Error fetching stock", error);
        }
      };
      fetchStock();
    } else {
      setCurrentStock(0);
    }
  }, [storeId, skuCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="bg-[#1B4D3E] text-white p-4 shadow-md flex justify-between items-center">
                <h1 className="text-xl font-bold">Staff Stock Input</h1>
                <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
                    Logout
                </button>
            </header>

    try {
      const token = localStorage.getItem("token");
      await api.post("/stocks", {
        store_id: storeId,
        sku_code: skuCode,
        stock_type: stockType,
        qty: parseInt(qty),
        reason: stockType === "Retur" ? reason : null,
        destination_store_id: stockType === "Transfer Barang" ? destStoreId : null,
      });
      setShowSuccessModal(true);
      setMessage("");
      setQty("");
      setReason("");
      setDestProvince("");
      setDestChannel("");
      setDestSubChannel("");
      setDestStoreId("");
      // Refresh current stock
      const res = await api.get("/stocks/current", {
        params: { store_id: storeId, sku_code: skuCode },
      });
      setCurrentStock(res.data.current_stock);
    } catch (error) {
      setMessage("Error updating stock: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

                        {/* Product & Stock Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-[#1B4D3E]">Stock Details</h2>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Type</label>
                                <select 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                                    value={stockType}
                                    onChange={(e) => setStockType(e.target.value)}
                                    required
                                >
                                    <option value="">Select Stock Type</option>
                                    {stockTypes.map((type) => (
                                        <option key={type.id} value={type.name}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-[#1B4D3E] text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Staff Stock Input</h1>
        <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded">
          Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {message && <div className={`mb-4 p-3 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{message}</div>}

                            {stockType === 'Stock Opname' ? (
                                // Stock Opname Mode UI
                                <div className="pt-8 text-center">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                        <h3 className="text-lg font-medium text-blue-900 mb-2">Stock Opname Mode</h3>
                                        <p className="text-blue-700 mb-4">
                                            Please download the stock opname sheet for the selected store below.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleDownloadOpname}
                                            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!storeId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!storeId}
                                        >
                                            <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Opname Sheet
                                        </button>
                                        {!storeId && <p className="text-sm text-red-500 mt-2 font-medium">Please select a store above to enable download.</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">SKU Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                                        placeholder="Search SKU Name..."
                                        value={skuSearchTerm}
                                        onChange={(e) => {
                                            setSkuSearchTerm(e.target.value);
                                            setSkuCode('');
                                            setIsSkuDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsSkuDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => {
                                            setIsSkuDropdownOpen(false);
                                            // Auto-fill code if exact name match found
                                            const match = products.find(p => p.sku_name.toLowerCase() === skuSearchTerm.toLowerCase());
                                            if (match) {
                                                setSkuCode(match.sku_code);
                                                setSkuSearchTerm(match.sku_name);
                                            }
                                        }, 200)}
                                    />
                                    {isSkuDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {products
                                                .filter(p => p.sku_name.toLowerCase().includes(skuSearchTerm.toLowerCase()))
                                                .map(p => (
                                                    <div
                                                        key={p.sku_code}
                                                        className="p-2 hover:bg-[#1B4D3E] hover:text-white cursor-pointer"
                                                        onMouseDown={() => {
                                                            setSkuCode(p.sku_code);
                                                            setSkuSearchTerm(p.sku_name);
                                                            setIsSkuDropdownOpen(false);
                                                        }}
                                                    >
                                                        {p.sku_name}
                                                    </div>
                                                ))
                                            }
                                            {products.filter(p => p.sku_name.toLowerCase().includes(skuSearchTerm.toLowerCase())).length === 0 && (
                                                <div className="p-2 text-gray-500">No products found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700">SKU Code</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                                        value={skuCode}
                                        onChange={(e) => {
                                            setSkuCode(e.target.value);
                                            setSkuSearchTerm('');
                                            setIsSkuCodeDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsSkuCodeDropdownOpen(true)}
                                         onBlur={() => setTimeout(() => {
                                             setIsSkuCodeDropdownOpen(false);
                                             // Auto-fill name if exact code match found
                                             const match = products.find(p => p.sku_code.toLowerCase() === skuCode.toLowerCase());
                                             if (match) {
                                                 setSkuCode(match.sku_code);
                                                 setSkuSearchTerm(match.sku_name);
                                             }
                                         }, 200)}
                                         placeholder="Search SKU Code..."
                                     />
                                    {isSkuCodeDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {products
                                                .filter(p => p.sku_code.toLowerCase().includes(skuCode.toLowerCase()))
                                                .map(p => (
                                                    <div
                                                        key={p.sku_code}
                                                        className="p-2 hover:bg-[#1B4D3E] hover:text-white cursor-pointer"
                                                        onMouseDown={() => {
                                                            setSkuCode(p.sku_code);
                                                            setSkuSearchTerm(p.sku_name);
                                                            setIsSkuCodeDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span className="font-bold">{p.sku_code}</span> - {p.sku_name}
                                                    </div>
                                                ))
                                            }
                                            {products.filter(p => p.sku_code.toLowerCase().includes(skuCode.toLowerCase())).length === 0 && (
                                                <div className="p-2 text-gray-500">No products found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                                    <input 
                                        type="text" 
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 p-2 border cursor-not-allowed"
                                        value={currentStock}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Qty Stock (Input)</label>
                                    <input 
                                        type="number" 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
                                        min="1"
                                        required
                                        placeholder="Enter quantity"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 bg-[#1B4D3E] hover:bg-[#143d30] text-white font-bold rounded-lg shadow-md transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Saving...' : 'Submit Stock Entry'}
                                </button>
                            </div>
                        </div>
                        )}
                    </div>

              {stockType === "Retur" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason for Return</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please explain why this item is being returned..."
                    required
                  />
                </div>
              )}

              {stockType === "Transfer Barang" && (
                <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                  <h3 className="text-md font-semibold text-[#1B4D3E]">Destination Store</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Province</label>
                      <div className="mt-1">
                        <SearchableDropdown
                          options={uniqueProvinces}
                          value={destProvince}
                          onChange={(val) => {
                            setDestProvince(val);
                            setDestChannel("");
                            setDestSubChannel("");
                            setDestStoreId("");
                          }}
                          placeholder="Select Province"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Channel {destProvince && `(${availableDestChannels.length})`}</label>
                      <div className="mt-1">
                        <SearchableDropdown
                          options={availableDestChannels}
                          value={destChannel}
                          onChange={(val) => {
                            setDestChannel(val);
                            setDestSubChannel("");
                            setDestStoreId("");
                          }}
                          placeholder="Select Channel"
                          disabled={!destProvince}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sub Channel {destChannel && `(${availableDestSubChannels.length})`}</label>
                      <div className="mt-1">
                        <SearchableDropdown
                          options={availableDestSubChannels}
                          value={destSubChannel}
                          onChange={(val) => {
                            setDestSubChannel(val);
                            setDestStoreId("");
                          }}
                          placeholder="Select Sub Channel"
                          disabled={!destChannel}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Store {destSubChannel && `(${availableDestStores.length})`}</label>
                      <div className="mt-1">
                        <SearchableDropdown options={availableDestStores} value={destStoreId} onChange={(val) => setDestStoreId(val)} placeholder="Select Store" labelKey="store_name" valueKey="id" disabled={!destSubChannel} required />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">SKU Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                    placeholder="Search SKU Name..."
                    value={skuSearchTerm}
                    onChange={(e) => {
                      setSkuSearchTerm(e.target.value);
                      setSkuCode("");
                      setIsSkuDropdownOpen(true);
                    }}
                    onFocus={() => setIsSkuDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => {
                        setIsSkuDropdownOpen(false);
                        // Auto-fill code if exact name match found
                        const match = products.find((p) => p.sku_name.toLowerCase() === skuSearchTerm.toLowerCase());
                        if (match) {
                          setSkuCode(match.sku_code);
                          setSkuSearchTerm(match.sku_name);
                        }
                      }, 200)
                    }
                  />
                  {isSkuDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {products
                        .filter((p) => p.sku_name.toLowerCase().includes(skuSearchTerm.toLowerCase()))
                        .map((p) => (
                          <div
                            key={p.sku_code}
                            className="p-2 hover:bg-[#1B4D3E] hover:text-white cursor-pointer"
                            onMouseDown={() => {
                              setSkuCode(p.sku_code);
                              setSkuSearchTerm(p.sku_name);
                              setIsSkuDropdownOpen(false);
                            }}
                          >
                            {p.sku_name}
                          </div>
                        ))}
                      {products.filter((p) => p.sku_name.toLowerCase().includes(skuSearchTerm.toLowerCase())).length === 0 && <div className="p-2 text-gray-500">No products found</div>}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">SKU Code</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                    value={skuCode}
                    onChange={(e) => {
                      setSkuCode(e.target.value);
                      setSkuSearchTerm("");
                      setIsSkuCodeDropdownOpen(true);
                    }}
                    onFocus={() => setIsSkuCodeDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => {
                        setIsSkuCodeDropdownOpen(false);
                        // Auto-fill name if exact code match found
                        const match = products.find((p) => p.sku_code.toLowerCase() === skuCode.toLowerCase());
                        if (match) {
                          setSkuCode(match.sku_code);
                          setSkuSearchTerm(match.sku_name);
                        }
                      }, 200)
                    }
                    placeholder="Search SKU Code..."
                  />
                  {isSkuCodeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {products
                        .filter((p) => p.sku_code.toLowerCase().includes(skuCode.toLowerCase()))
                        .map((p) => (
                          <div
                            key={p.sku_code}
                            className="p-2 hover:bg-[#1B4D3E] hover:text-white cursor-pointer"
                            onMouseDown={() => {
                              setSkuCode(p.sku_code);
                              setSkuSearchTerm(p.sku_name);
                              setIsSkuCodeDropdownOpen(false);
                            }}
                          >
                            <span className="font-bold">{p.sku_code}</span> - {p.sku_name}
                          </div>
                        ))}
                      {products.filter((p) => p.sku_code.toLowerCase().includes(skuCode.toLowerCase())).length === 0 && <div className="p-2 text-gray-500">No products found</div>}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 p-2 border cursor-not-allowed" value={currentStock} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qty Stock (Input)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B4D3E] focus:ring focus:ring-[#1B4D3E] focus:ring-opacity-50 p-2 border"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    min="1"
                    required
                    placeholder="Enter quantity"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isLoading} className={`w-full py-3 px-4 bg-[#1B4D3E] hover:bg-[#143d30] text-white font-bold rounded-lg shadow-md transition-all ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
                {isLoading ? "Saving..." : "Submit Stock Entry"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
            <p className="text-sm text-gray-500 mb-6">Stock data has been successfully submitted.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#1B4D3E] text-base font-medium text-white hover:bg-[#143d30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4D3E] sm:text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard; 
