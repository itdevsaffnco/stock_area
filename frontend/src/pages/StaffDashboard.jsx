import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchableDropdown from "../components/SearchableDropdown";
import api from "../services/api";

function StaffDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  // Form States
  const [province, setProvince] = useState("");
  const [subChannel, setSubChannel] = useState("");
  const [channel, setChannel] = useState("");
  const [storeId, setStoreId] = useState("");

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
        const token = localStorage.getItem("token");
        const [storesRes, productsRes] = await Promise.all([axios.get("api/stores", { headers: { Authorization: `Bearer ${token}` } }), axios.get("api/products", { headers: { Authorization: `Bearer ${token}` } })]);
        setStores(storesRes.data);
        setProducts(productsRes.data);
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

  // 3. Store depends on Province AND Channel AND Sub Channel
  const availableStores = stores.filter((s) => s.province === province && s.channel === channel && s.sub_channel === subChannel).sort((a, b) => a.store_name.localeCompare(b.store_name));

  // Derived Lists for Destination Waterfall
  const availableDestChannels = stores
    .filter((s) => s.province === destProvince)
    .map((s) => s.channel)
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .sort();

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
          const token = localStorage.getItem("token");
          const res = await axios.get(`api/stocks/current?store_id=${storeId}&sku_code=${skuCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
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

    if (!skuCode) {
      setMessage("Error: Please select a valid product from the list.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "api/stocks",
        {
          store_id: storeId,
          sku_code: skuCode,
          stock_type: stockType,
          qty: parseInt(qty),
          reason: stockType === "Retur" ? reason : null,
          destination_store_id: stockType === "Transfer Barang" ? destStoreId : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setShowSuccessModal(true);
      setMessage("");
      setQty("");
      setReason("");
      setDestProvince("");
      setDestChannel("");
      setDestSubChannel("");
      setDestStoreId("");
      // Refresh current stock
      const res = await axios.get(`api/stocks/current?store_id=${storeId}&sku_code=${skuCode}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const selectedProduct = products.find((p) => p.sku_code === skuCode);

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Section */}
            <div className="space-y-4 border-b pb-6">
              <h2 className="text-lg font-semibold text-[#1B4D3E]">Store Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <div className="mt-1">
                    <SearchableDropdown
                      options={uniqueProvinces}
                      value={province}
                      onChange={(val) => {
                        setProvince(val);
                        setChannel("");
                        setSubChannel("");
                        setStoreId("");
                      }}
                      placeholder="Select Province"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel {province && `(${availableChannels.length})`}</label>
                  <div className="mt-1">
                    <SearchableDropdown
                      options={availableChannels}
                      value={channel}
                      onChange={(val) => {
                        setChannel(val);
                        setSubChannel("");
                        setStoreId("");
                      }}
                      placeholder="Select Channel"
                      disabled={!province}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sub Channel {channel && `(${availableSubChannels.length})`}</label>
                  <div className="mt-1">
                    <SearchableDropdown
                      options={availableSubChannels}
                      value={subChannel}
                      onChange={(val) => {
                        setSubChannel(val);
                        setStoreId("");
                      }}
                      placeholder="Select Sub Channel"
                      disabled={!channel}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store {subChannel && `(${availableStores.length})`}</label>
                  <div className="mt-1">
                    <SearchableDropdown options={availableStores} value={storeId} onChange={(val) => setStoreId(val)} placeholder="Select Store" labelKey="store_name" valueKey="id" disabled={!subChannel} required />
                  </div>
                </div>
              </div>
            </div>

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
                  <option value="Penjualan">Penjualan</option>
                  <option value="Pengiriman">Pengiriman</option>
                  <option value="Retur">Retur</option>
                  <option value="Tester">Tester</option>
                  <option value="Transfer Barang">Transfer Barang</option>
                </select>
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
