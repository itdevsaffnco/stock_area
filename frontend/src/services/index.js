import api from "./api";

export const storeService = {
  getAll: () => api.get("/stores"),
  getById: (id) => api.get(`/stores/${id}`),
  create: (data) => api.post("/stores", data),
  update: (id, data) => api.put(`/stores/${id}`, data),
  delete: (id) => api.delete(`/stores/${id}`),
};

export const productService = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const stockService = {
  getAll: () => api.get("/stocks"),
  getCurrent: (storeId, skuCode) =>
    api.get("/stocks/current", {
      params: { store_id: storeId, sku_code: skuCode },
    }),
  create: (data) => api.post("/stocks", data),
  update: (id, data) => api.put(`/stocks/${id}`, data),
  delete: (id) => api.delete(`/stocks/${id}`),
  getByStore: (storeId) =>
    api.get("/stocks", {
      params: { store_id: storeId },
    }),
  approve: (id, data) => api.put(`/stocks/${id}/approve`, data),
  tracking: (id, data) => api.put(`/stocks/${id}/tracking`, data),
  downloadOpnameTemplate: (storeId) =>
    api.get("/stocks/opname-template", {
      params: { store_id: storeId },
      responseType: "blob",
    }),
};

export const stockTypeService = {
  getAll: () => api.get("/stock-types"),
  create: (data) => api.post("/stock-types", data),
  delete: (id) => api.delete(`/stock-types/${id}`),
  update: (id, data) => api.put(`/stock-types/${id}`, data),
};

export const userService = {
  getAll: () => api.get("/users"),
  create: (data) => api.post("/users", data),
};

export const authService = {
  login: (email, password) => api.post("/login", { email, password }),
  logout: () => {
    localStorage.removeItem("token");
  },
};
