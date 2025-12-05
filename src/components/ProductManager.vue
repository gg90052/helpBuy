<script setup>
import { ref, onMounted } from "vue";
import ProductForm from "./ProductForm.vue";
import { useProductManager } from "../composables/useProductManager";

const emit = defineEmits(["back"]);

const {
  loading,
  error,
  fetchCategories,
  fetchProducts,
  createCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
} = useProductManager();

// 密碼驗證
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const isAuthenticated = ref(false);
const passwordInput = ref("");
const passwordError = ref("");

// 資料
const categories = ref([]);
const products = ref([]);
const dataLoading = ref(false);
const dataError = ref(null);

// Modal 控制
const showFormModal = ref(false);
const editingProduct = ref(null);

// 刪除確認
const showDeleteConfirm = ref(false);
const deletingProduct = ref(null);

// 驗證密碼
const verifyPassword = () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    isAuthenticated.value = true;
    passwordError.value = "";
    loadData();
  } else {
    passwordError.value = "密碼錯誤，請重新輸入";
  }
};

// 載入資料
const loadData = async () => {
  dataLoading.value = true;
  dataError.value = null;

  try {
    const [categoriesData, productsData] = await Promise.all([
      fetchCategories(),
      fetchProducts(),
    ]);
    categories.value = categoriesData;
    products.value = productsData;
  } catch (err) {
    dataError.value = err.message;
  } finally {
    dataLoading.value = false;
  }
};

// 開啟新增表單
const openAddForm = () => {
  editingProduct.value = null;
  showFormModal.value = true;
};

// 開啟編輯表單
const openEditForm = (product) => {
  editingProduct.value = product;
  showFormModal.value = true;
};

// 關閉表單
const closeForm = () => {
  showFormModal.value = false;
  editingProduct.value = null;
};

// 處理表單提交
const handleFormSubmit = async (formData) => {
  try {
    if (editingProduct.value) {
      // 更新商品
      const updated = await updateProduct(editingProduct.value.id, formData);
      const index = products.value.findIndex(
        (p) => p.id === editingProduct.value.id
      );
      if (index !== -1) {
        products.value[index] = updated;
      }
    } else {
      // 新增商品
      const created = await createProduct(formData);
      products.value.push(created);
    }
    closeForm();
  } catch (err) {
    alert(err.message);
  }
};

// 處理新增類別
const handleAddCategory = async (name) => {
  try {
    const created = await createCategory(name);
    categories.value.push(created);
  } catch (err) {
    alert(err.message);
  }
};

// 開啟刪除確認
const openDeleteConfirm = (product) => {
  deletingProduct.value = product;
  showDeleteConfirm.value = true;
};

// 關閉刪除確認
const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  deletingProduct.value = null;
};

// 確認刪除
const confirmDelete = async () => {
  if (!deletingProduct.value) return;

  try {
    await deleteProduct(deletingProduct.value.id);
    products.value = products.value.filter(
      (p) => p.id !== deletingProduct.value.id
    );
    closeDeleteConfirm();
  } catch (err) {
    alert(err.message);
  }
};

// 取得類別名稱
const getCategoryName = (product) => {
  return product.categories?.name || "未分類";
};

// 格式化價格
const formatPrice = (price) => {
  return new Intl.NumberFormat("zh-TW").format(price);
};

// 切換商品顯示狀態
const handleToggleVisibility = async (product) => {
  try {
    const updated = await toggleProductVisibility(
      product.id,
      product.is_visible
    );
    const index = products.value.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      products.value[index] = updated;
    }
  } catch (err) {
    alert(err.message);
  }
};

// 返回首頁
const goBack = () => {
  emit("back");
};
</script>

<template>
  <div class="min-h-screen bg-cream pt-20 pb-12">
    <div class="max-w-6xl mx-auto px-4">
      <!-- 未驗證：密碼輸入 -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto mt-20">
        <div class="bg-white rounded-2xl shadow-sm p-8">
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-sakura/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-sakura-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 class="text-xl font-medium text-charcoal">商品管理</h2>
            <p class="text-warm-gray text-sm mt-1">請輸入管理密碼以繼續</p>
          </div>

          <form @submit.prevent="verifyPassword" class="space-y-4">
            <div>
              <input
                v-model="passwordInput"
                type="password"
                placeholder="請輸入密碼"
                class="w-full px-4 py-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura focus:border-transparent transition-all text-center"
                autofocus
              />
              <p
                v-if="passwordError"
                class="text-red-500 text-sm mt-2 text-center"
              >
                {{ passwordError }}
              </p>
            </div>
            <button
              type="submit"
              class="w-full py-3 bg-sakura-dark hover:bg-sakura-dark/90 text-white rounded-lg transition-colors font-medium"
            >
              進入管理
            </button>
            <button
              type="button"
              @click="goBack"
              class="w-full py-3 bg-soft-gray hover:bg-light-gray text-charcoal rounded-lg transition-colors"
            >
              返回首頁
            </button>
          </form>
        </div>
      </div>

      <!-- 已驗證：管理頁面 -->
      <div v-else>
        <!-- 標題列 -->
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div class="flex items-center justify-between sm:block">
            <div>
              <h1 class="text-xl sm:text-2xl font-medium text-charcoal">
                商品管理
              </h1>
              <p class="text-warm-gray text-sm mt-0.5">
                共 {{ products.length }} 件商品
              </p>
            </div>
            <!-- 手機版返回按鈕 -->
            <button
              @click="goBack"
              class="sm:hidden p-2 bg-soft-gray hover:bg-light-gray text-charcoal rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          </div>
          <div class="flex gap-2 sm:gap-3">
            <!-- 桌面版返回按鈕 -->
            <button
              @click="goBack"
              class="hidden sm:flex px-4 py-2 bg-soft-gray hover:bg-light-gray text-charcoal rounded-lg transition-colors items-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              返回
            </button>
            <button
              @click="openAddForm"
              class="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-sakura-dark hover:bg-sakura-dark/90 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新增商品
            </button>
          </div>
        </div>

        <!-- 載入中 -->
        <div v-if="dataLoading" class="flex items-center justify-center py-20">
          <div class="text-center">
            <svg
              class="w-12 h-12 animate-spin text-sakura-dark mx-auto"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p class="text-warm-gray mt-4">載入中...</p>
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div
          v-else-if="dataError"
          class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
        >
          <p class="text-red-600">{{ dataError }}</p>
          <button
            @click="loadData"
            class="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            重試
          </button>
        </div>

        <!-- 商品列表 -->
        <div v-else>
          <!-- 空狀態 -->
          <div
            v-if="products.length === 0"
            class="bg-white rounded-2xl shadow-sm py-20 text-center"
          >
            <svg
              class="w-16 h-16 text-light-gray mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p class="text-warm-gray">目前沒有商品</p>
            <button
              @click="openAddForm"
              class="mt-4 px-4 py-2 bg-sakura-dark hover:bg-sakura-dark/90 text-white rounded-lg transition-colors"
            >
              新增第一件商品
            </button>
          </div>

          <!-- 手機版：卡片列表 -->
          <div v-else class="md:hidden space-y-3">
            <div
              v-for="product in products"
              :key="product.id"
              class="bg-white rounded-xl shadow-sm p-4"
            >
              <div class="flex gap-4">
                <!-- 商品圖片 -->
                <img
                  :src="product.images?.[0] || 'https://via.placeholder.com/80'"
                  :alt="product.name"
                  class="w-20 h-20 object-cover rounded-lg bg-soft-gray flex-shrink-0"
                  @error="
                    (e) => (e.target.src = 'https://via.placeholder.com/80')
                  "
                />
                <!-- 商品資訊 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-medium text-charcoal truncate">
                      {{ product.name }}
                    </h3>
                    <span
                      v-if="!product.is_visible"
                      class="px-2 py-0.5 text-xs bg-warm-gray/20 text-warm-gray rounded"
                    >
                      隱藏
                    </span>
                  </div>
                  <p class="text-sm text-warm-gray mt-0.5">
                    {{ getCategoryName(product) }}
                  </p>
                  <p class="text-sakura-dark font-semibold mt-1">
                    ￥{{ formatPrice(product.price) }}
                  </p>
                </div>
              </div>
              <!-- 操作按鈕 -->
              <div class="flex gap-2 mt-3 pt-3 border-t border-light-gray">
                <button
                  @click="handleToggleVisibility(product)"
                  class="px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  :class="
                    product.is_visible
                      ? 'text-warm-gray bg-soft-gray hover:bg-light-gray'
                      : 'text-sakura-dark bg-sakura/10 hover:bg-sakura/20'
                  "
                  :title="product.is_visible ? '隱藏商品' : '顯示商品'"
                >
                  <svg
                    v-if="product.is_visible"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.906 5.236m-11.72 0A10.025 10.025 0 012.457 12m6.586 0l-6.586 0"
                    />
                  </svg>
                  {{ product.is_visible ? "隱藏" : "顯示" }}
                </button>
                <button
                  @click="openEditForm(product)"
                  class="flex-1 py-2 text-sm text-charcoal bg-soft-gray hover:bg-light-gray rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  編輯
                </button>
                <button
                  @click="openDeleteConfirm(product)"
                  class="flex-1 py-2 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  刪除
                </button>
              </div>
            </div>
          </div>

          <!-- 桌面版：表格 -->
          <div
            v-if="products.length > 0"
            class="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <table class="w-full">
              <thead class="bg-soft-gray">
                <tr>
                  <th
                    class="px-6 py-4 text-left text-sm font-medium text-charcoal"
                  >
                    商品
                  </th>
                  <th
                    class="px-6 py-4 text-left text-sm font-medium text-charcoal"
                  >
                    類別
                  </th>
                  <th
                    class="px-6 py-4 text-right text-sm font-medium text-charcoal"
                  >
                    價格
                  </th>
                  <th
                    class="px-6 py-4 text-center text-sm font-medium text-charcoal"
                  >
                    狀態
                  </th>
                  <th
                    class="px-6 py-4 text-center text-sm font-medium text-charcoal"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-light-gray">
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="hover:bg-soft-gray/50 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                      <img
                        :src="
                          product.images?.[0] ||
                          'https://via.placeholder.com/60'
                        "
                        :alt="product.name"
                        class="w-14 h-14 object-cover rounded-lg bg-soft-gray"
                        @error="
                          (e) =>
                            (e.target.src = 'https://via.placeholder.com/60')
                        "
                      />
                      <div>
                        <p class="font-medium text-charcoal">
                          {{ product.name }}
                        </p>
                        <span
                          v-if="!product.is_visible"
                          class="text-xs text-warm-gray"
                        >
                          隱藏中
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-warm-gray">
                    {{ getCategoryName(product) }}
                  </td>
                  <td class="px-6 py-4 text-right font-medium text-charcoal">
                    ￥ {{ formatPrice(product.price) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-center">
                      <button
                        @click="handleToggleVisibility(product)"
                        class="p-2 rounded-lg transition-colors"
                        :class="
                          product.is_visible
                            ? 'text-warm-gray hover:text-sakura-dark hover:bg-sakura/10'
                            : 'text-sakura-dark bg-sakura/10 hover:bg-sakura/20'
                        "
                        :title="product.is_visible ? '隱藏商品' : '顯示商品'"
                      >
                        <svg
                          v-if="product.is_visible"
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <svg
                          v-else
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.906 5.236m-11.72 0A10.025 10.025 0 012.457 12m6.586 0l-6.586 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="openEditForm(product)"
                        class="p-2 text-warm-gray hover:text-sakura-dark hover:bg-sakura/10 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <svg
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        @click="openDeleteConfirm(product)"
                        class="p-2 text-warm-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <svg
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯 Modal -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showFormModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      >
        <!-- 背景遮罩 -->
        <div
          class="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
          @click="closeForm"
        ></div>

        <!-- Modal 內容 - 手機版從底部滑出，桌面版置中 -->
        <div
          class="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div
            class="sticky top-0 bg-white px-4 sm:px-6 py-4 border-b border-light-gray flex items-center justify-between flex-shrink-0"
          >
            <h3 class="text-lg font-medium text-charcoal">
              {{ editingProduct ? "編輯商品" : "新增商品" }}
            </h3>
            <button
              @click="closeForm"
              class="p-2 -mr-2 text-warm-gray hover:text-charcoal rounded-lg transition-colors"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="p-4 sm:p-6 overflow-y-auto flex-1">
            <ProductForm
              :product="editingProduct"
              :categories="categories"
              :loading="loading"
              @submit="handleFormSubmit"
              @cancel="closeForm"
              @addCategory="handleAddCategory"
            />
          </div>
        </div>
      </div>
    </transition>

    <!-- 刪除確認 Modal -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      >
        <!-- 背景遮罩 -->
        <div
          class="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
          @click="closeDeleteConfirm"
        ></div>

        <!-- Modal 內容 -->
        <div
          class="relative bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-xl p-6"
        >
          <div class="text-center">
            <div
              class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-7 h-7 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-charcoal mb-2">確認刪除</h3>
            <p class="text-warm-gray mb-6">
              確定要刪除「{{ deletingProduct?.name }}」嗎？<br />
              此操作無法復原。
            </p>
            <div class="flex gap-3">
              <button
                @click="closeDeleteConfirm"
                class="flex-1 px-4 py-3 sm:py-2.5 bg-soft-gray hover:bg-light-gray text-charcoal rounded-lg transition-colors"
                :disabled="loading"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
                class="flex-1 px-4 py-3 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                :disabled="loading"
              >
                {{ loading ? "刪除中..." : "確認刪除" }}
              </button>
            </div>
          </div>
          <!-- 手機版底部安全區域 -->
          <div class="h-safe sm:hidden"></div>
        </div>
      </div>
    </transition>
  </div>
</template>
