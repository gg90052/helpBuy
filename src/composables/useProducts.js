import { ref, onMounted } from "vue";
import { supabase } from "../config/supabase";
import inStockData from "../data/inStockProducts.json";

const productsData = ref(null);
const loading = ref(false);
const error = ref(null);

export function useProducts() {
  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;

    try {
      // 同時取得類別和商品資料
      const [categoriesResult, productsResult] = await Promise.all([
        supabase.from("categories").select("*").order("id"),
        supabase
          .from("products")
          .select(
            `
            *,
            categories (
              name
            )
          `
          )
          .eq("is_visible", true)
          .order("id"),
      ]);

      // 檢查錯誤
      if (categoriesResult.error) {
        throw new Error(`載入類別資料失敗: ${categoriesResult.error.message}`);
      }

      if (productsResult.error) {
        throw new Error(`載入商品資料失敗: ${productsResult.error.message}`);
      }

      // 轉換類別資料格式（從資料庫格式轉換為應用程式格式）
      // 「現貨區」放在「全部」之後，作為特殊分類
      const categories = [
        "全部",
        "現貨區",
        ...categoriesResult.data.map((cat) => cat.name),
      ];

      // 轉換商品資料格式（來自資料庫）
      const dbProducts = productsResult.data.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.categories?.name || "",
        description: product.description || "",
        images: Array.isArray(product.images) ? product.images : [],
      }));

      // 現貨區商品（來自本地 JSON）
      const inStockProducts = inStockData.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: "現貨區",
        description: product.description || "",
        images: Array.isArray(product.images) ? product.images : [],
      }));

      productsData.value = {
        categories,
        products: [...inStockProducts, ...dbProducts],
      };
    } catch (err) {
      error.value = err.message || "載入商品資料時發生錯誤";
      console.error("載入商品資料錯誤:", err);
      productsData.value = null;
    } finally {
      loading.value = false;
    }
  };

  // 在組件掛載時自動載入資料
  onMounted(() => {
    fetchProducts();
  });

  return {
    productsData,
    loading,
    error,
    fetchProducts,
  };
}
