import { ref } from "vue";
import { supabase } from "../config/supabase";

const loading = ref(false);
const error = ref(null);

export function useProductManager() {
  // 取得所有類別（不含「全部」）
  const fetchCategories = async () => {
    const { data, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .order("id");

    if (fetchError) {
      throw new Error(`載入類別失敗: ${fetchError.message}`);
    }

    return data;
  };

  // 取得所有商品（含類別資訊）
  const fetchProducts = async () => {
    const { data, error: fetchError } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name
        )
      `
      )
      .order("id");

    if (fetchError) {
      throw new Error(`載入商品失敗: ${fetchError.message}`);
    }

    return data;
  };

  // 新增類別
  const createCategory = async (name) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: createError } = await supabase
        .from("categories")
        .insert([{ name }])
        .select()
        .single();

      if (createError) {
        throw new Error(`新增類別失敗: ${createError.message}`);
      }

      return data;
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
      const { data, error: createError } = await supabase
        .from("products")
        .insert([
          {
            name: product.name,
            price: product.price,
            category_id: product.category_id,
            description: product.description,
            images: product.images || [],
            is_visible: product.is_visible !== undefined ? product.is_visible : true,
            is_pinned: product.is_pinned !== undefined ? product.is_pinned : false,
          },
        ])
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `
        )
        .single();

      if (createError) {
        throw new Error(`新增商品失敗: ${createError.message}`);
      }

      return data;
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
      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          name: product.name,
          price: product.price,
          category_id: product.category_id,
          description: product.description,
          images: product.images || [],
          is_visible: product.is_visible !== undefined ? product.is_visible : true,
          is_pinned: product.is_pinned !== undefined ? product.is_pinned : false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `
        )
        .single();

      if (updateError) {
        throw new Error(`更新商品失敗: ${updateError.message}`);
      }

      return data;
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
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(`刪除商品失敗: ${deleteError.message}`);
      }

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
      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          is_visible: !currentVisibility,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `
        )
        .single();

      if (updateError) {
        throw new Error(`切換顯示狀態失敗: ${updateError.message}`);
      }

      return data;
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
      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          is_pinned: !currentPinned,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `
        )
        .single();

      if (updateError) {
        throw new Error(`切換置頂狀態失敗: ${updateError.message}`);
      }

      return data;
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

