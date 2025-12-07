<script setup>
import { ref, computed } from "vue";
import { useCart } from "../composables/useCart";
import ImageLightbox from "./ImageLightbox.vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  priority: {
    type: Boolean,
    default: false,
  },
});

const { addToCart } = useCart();

const showAdded = ref(false);
const showLightbox = ref(false);

const isInStock = computed(() => props.product.category === "現貨區");

// 將文字中的 URL 轉換為超連結（使用 computed 快取結果）
const linkedDescription = computed(() => {
  const text = props.product.description;
  if (!text) return "";

  // 匹配 http://、https:// 開頭的 URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sakura-dark underline hover:text-sakura-dark/80">${url}</a>`;
  });
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("zh-TW").format(price);
};

const handleAddToCart = () => {
  addToCart(props.product, 1);
  showAdded.value = true;
  setTimeout(() => {
    showAdded.value = false;
  }, 1500);
};

const openLightbox = () => {
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};
</script>

<template>
  <article
    class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
  >
    <!-- Image Container -->
    <div
      class="relative aspect-square overflow-hidden bg-light-gray cursor-pointer"
      @click="openLightbox"
    >
      <!-- Images - 只顯示第一張圖片 -->
      <div class="relative w-full h-full">
        <img
          :src="product.images[0]"
          :alt="`${product.name} - 圖片 1`"
          class="absolute inset-0 w-full h-full object-cover"
          :loading="priority ? 'eager' : 'lazy'"
          :fetchpriority="priority ? 'high' : 'auto'"
          decoding="async"
        />
      </div>

      <!-- Category Badge -->
      <span
        class="absolute top-3 left-3 px-3 py-1 bg-cream/90 backdrop-blur-sm rounded-full text-xs text-charcoal"
      >
        {{ product.category }}
      </span>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-medium text-charcoal mb-1 line-clamp-1">
        {{ product.name }}
      </h3>
      <div
        class="text-sm text-warm-gray mb-3 line-clamp-3 h-[3.75rem]"
        v-html="linkedDescription"
      ></div>
      <p
        class="text-lg font-medium text-sakura-dark mb-3"
        :class="{ invisible: product.price <= 1 }"
      >
        <template v-if="isInStock">
          NTD ${{ formatPrice(product.price) }}
        </template>
        <template v-else>
          日幣參考價格：￥{{ formatPrice(product.price) }}
        </template>
      </p>

      <!-- Add to Cart Button -->
      <button
        @click="handleAddToCart"
        :class="[
          'w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
          showAdded
            ? 'bg-matcha text-charcoal'
            : 'bg-charcoal text-cream hover:bg-charcoal/90',
        ]"
      >
        {{ showAdded ? "已加入購物清單 ✓" : "加入購物清單" }}
      </button>
    </div>

    <!-- Lightbox -->
    <ImageLightbox
      :images="product.images"
      :initial-index="0"
      :visible="showLightbox"
      @close="closeLightbox"
    />
  </article>
</template>

<style scoped></style>
