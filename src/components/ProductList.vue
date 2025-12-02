<script setup>
import { ref, computed } from "vue";
import CategoryTabs from "./CategoryTabs.vue";
import ProductCard from "./ProductCard.vue";

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["retry"]);

const activeCategory = ref("全部");
const searchQuery = ref("");

const filteredProducts = computed(() => {
  let filtered = props.products;

  // 先根據分類篩選
  if (activeCategory.value !== "全部") {
    filtered = filtered.filter(
      (product) => product.category === activeCategory.value
    );
  }

  // 再根據搜尋關鍵字篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const description = (product.description || "").toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }

  return filtered;
});
</script>

<template>
  <section id="products" class="pt-6 pb-20 bg-cream">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Search Box -->
      <div class="mb-6" v-if="!loading && !error">
        <div class="max-w-md mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜尋商品名稱或描述..."
              class="w-full px-4 py-3 pl-12 pr-4 bg-white border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura-dark focus:border-transparent text-charcoal placeholder-warm-gray"
            />
            <svg
              class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
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
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="mb-8" v-if="!loading && !error">
        <CategoryTabs
          :categories="categories"
          v-model:activeCategory="activeCategory"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div
          class="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sakura-dark mb-4"
        ></div>
        <p class="text-warm-gray text-lg">載入商品資料中...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20 px-4">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-light-gray rounded-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-warm-gray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-medium text-charcoal mb-2">載入失敗</h3>
        <p class="text-warm-gray mb-6">{{ error }}</p>
        <button
          @click="$emit('retry')"
          class="px-6 py-2 bg-sakura-dark text-white rounded-lg hover:bg-sakura-dark/90 transition-colors"
        >
          重新載入
        </button>
      </div>

      <!-- Products Grid -->
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && !error && filteredProducts.length === 0"
        class="text-center py-16"
      >
        <div
          class="w-16 h-16 mx-auto mb-4 bg-light-gray rounded-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-warm-gray"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p class="text-warm-gray">
          {{ searchQuery ? "找不到符合搜尋條件的商品" : "此分類目前沒有商品" }}
        </p>
      </div>
    </div>
  </section>
</template>
