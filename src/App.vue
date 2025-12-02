<script setup>
import { ref, computed } from "vue";
import NavBar from "./components/NavBar.vue";
import HeroSection from "./components/HeroSection.vue";
import ProductList from "./components/ProductList.vue";
import FAQ from "./components/FAQ.vue";
import Cart from "./components/Cart.vue";
import { useProducts } from "./composables/useProducts";

// Google Sheets Web App URL - 請替換成您的 Google Apps Script Web App URL
const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbwBmPyIUTmA437Zl4eldXI0xDMs17H4R8KTLk0FEodpBFiq0N-Pjh91N0hdDvEpfehy/exec";

const { productsData, loading, error, fetchProducts } =
  useProducts(GOOGLE_SHEETS_URL);

// 商品資料一律從 Google Sheets 取得
const categories = computed(() => {
  return productsData.value?.categories || [];
});

const products = computed(() => {
  return productsData.value?.products || [];
});

// FAQ 寫死在程式碼中
const faqs = [
  // {
  //   id: 1,
  //   question: "代購流程是什麼？",
  //   answer:
  //     "選擇商品後，透過 LINE 或表單聯繫我們，確認庫存與金額後匯款，我們會在日本當地採購並寄送給您。一般作業時間約 7-14 個工作天。",
  // },
  // {
  //   id: 2,
  //   question: "運費如何計算？",
  //   answer:
  //     "運費依包裹重量與體積計算，一般小型包裹約 NT$200-500。滿 NT$3000 可享免運優惠（限台灣本島）。",
  // },
  // {
  //   id: 3,
  //   question: "可以代購網站上沒有的商品嗎？",
  //   answer:
  //     "當然可以！只要是日本當地可購買的商品，都歡迎詢問。請提供商品名稱、圖片或連結，我們會盡快報價。",
  // },
  // {
  //   id: 4,
  //   question: "付款方式有哪些？",
  //   answer:
  //     "目前提供銀行轉帳、LINE Pay 兩種付款方式。確認訂單後會提供匯款資訊。",
  // },
  // {
  //   id: 5,
  //   question: "商品有保固嗎？",
  //   answer:
  //     "電器類商品享有原廠保固，但需自行送修日本。一般消耗品不提供保固，但如有瑕疵會協助處理退換貨。",
  // },
];

const currentView = ref("home");

const navigate = (view) => {
  currentView.value = view;
  window.scrollTo({ top: 0 });
};

const goToProducts = () => {
  currentView.value = "home";
  // 延遲滾動以確保頁面已切換
  setTimeout(() => {
    const element = document.getElementById("products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
};
</script>

<template>
  <div class="min-h-screen bg-cream">
    <!-- Navigation -->
    <NavBar :currentView="currentView" @navigate="navigate" />

    <!-- Main Content -->
    <main>
      <template v-if="currentView === 'home'">
        <!-- Hero Section -->
        <HeroSection />

        <!-- Products Section -->
        <ProductList
          :categories="categories"
          :products="products"
          :loading="loading"
          :error="error"
          @retry="fetchProducts"
        />

        <!-- FAQ Section -->
        <FAQ :faqs="faqs" />
      </template>

      <template v-else-if="currentView === 'cart'">
        <!-- Cart Section -->
        <div class="pt-16">
          <Cart @goToProducts="goToProducts" />
        </div>
      </template>
    </main>
  </div>
</template>
