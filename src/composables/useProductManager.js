import { ref } from "vue";
import { api } from "../config/api";

const loading = ref(false);
const error = ref(null);

export function useProductManager() {
  // 取得所有類別（不含「全部」）
  const fetchCategories = async () => {
    const res = await api.get('/api/categories');
    return res.data;
  };

  // 取得所有商品（含類別資訊）
  const fetchProducts = async () => {
    const res = await api.get('/api/products');
    return res.data;
  };

  // 新增類別
  const createCategory = async (name) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.post('/api/categories', { name });
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 新增商品
  const createProduct = async (product) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.post('/api/products', {
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        description: product.description,
        images: product.images || [],
        is_visible: product.is_visible !== undefined ? product.is_visible : true,
        is_pinned: product.is_pinned !== undefined ? product.is_pinned : false,
      });
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 更新商品
  const updateProduct = async (id, product) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.put(`/api/products/${id}`, {
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        description: product.description,
        images: product.images || [],
        is_visible: product.is_visible !== undefined ? product.is_visible : true,
        is_pinned: product.is_pinned !== undefined ? product.is_pinned : false,
      });
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 刪除商品
  const deleteProduct = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      await api.delete(`/api/products/${id}`);
      return true;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 切換商品顯示狀態
  const toggleProductVisibility = async (id, currentVisibility) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.patch(`/api/products/${id}/visibility`);
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 切換商品置頂狀態
  const toggleProductPinned = async (id, currentPinned) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await api.patch(`/api/products/${id}/pinned`);
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    fetchCategories,
    fetchProducts,
    createCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    toggleProductPinned,
  };
}
