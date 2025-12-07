<script setup>
import { ref, computed } from "vue";
import { useCart } from "../composables/useCart";
import ImageLightbox from "./ImageLightbox.vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const { addToCart } = useCart();

const currentImageIndex = ref(0);
const showAdded = ref(false);
const showLightbox = ref(false);

// 觸摸滑動相關
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);
const swipeThreshold = 50; // 滑動閾值（像素）

const hasMultipleImages = computed(() => props.product.images.length > 1);
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

const nextImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value =
      (currentImageIndex.value + 1) % props.product.images.length;
  }
};

const prevImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value =
      currentImageIndex.value === 0
        ? props.product.images.length - 1
        : currentImageIndex.value - 1;
  }
};

const goToImage = (index) => {
  currentImageIndex.value = index;
};

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

// 觸摸事件處理
const handleTouchStart = (e) => {
  if (!hasMultipleImages.value) return;
  const touch = e.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
};

const handleTouchMove = (e) => {
  // 只在確定是水平滑動時才阻止默認行為，允許垂直滾動
  if (!hasMultipleImages.value) return;
  const touch = e.touches[0];
  const deltaX = Math.abs(touch.clientX - touchStartX.value);
  const deltaY = Math.abs(touch.clientY - touchStartY.value);

  // 如果水平移動距離大於垂直移動距離，才阻止默認行為
  if (deltaX > deltaY) {
    e.preventDefault();
  }
};

const handleTouchEnd = (e) => {
  if (!hasMultipleImages.value) return;
  const touch = e.changedTouches[0];
  touchEndX.value = touch.clientX;
  touchEndY.value = touch.clientY;

  const deltaX = touchStartX.value - touchEndX.value;
  const deltaY = touchStartY.value - touchEndY.value;

  // 判斷是否為水平滑動（水平距離大於垂直距離）
  if (
    Math.abs(deltaX) > Math.abs(deltaY) &&
    Math.abs(deltaX) > swipeThreshold
  ) {
    if (deltaX > 0) {
      // 向左滑動，顯示下一張
      nextImage();
    } else {
      // 向右滑動，顯示上一張
      prevImage();
    }
  }
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
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Images - 優化：只渲染當前圖片，減少 DOM 節點 -->
      <div class="relative w-full h-full">
        <Transition name="fade" mode="out-in">
          <img
            :key="currentImageIndex"
            :src="product.images[currentImageIndex]"
            :alt="`${product.name} - 圖片 ${currentImageIndex + 1}`"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </Transition>
      </div>

      <!-- Navigation Arrows (only show if multiple images) -->
      <template v-if="hasMultipleImages">
        <button
          @click.stop="prevImage"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="上一張圖片"
        >
          <svg
            class="w-4 h-4 text-charcoal"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          @click.stop="nextImage"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="下一張圖片"
        >
          <svg
            class="w-4 h-4 text-charcoal"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Dots Indicator -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          <button
            v-for="(_, index) in product.images"
            :key="index"
            @click.stop="goToImage(index)"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentImageIndex
                ? 'bg-charcoal w-4'
                : 'bg-white/70 hover:bg-white',
            ]"
            :aria-label="`前往圖片 ${index + 1}`"
          />
        </div>
      </template>

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
      :initial-index="currentImageIndex"
      :visible="showLightbox"
      @close="closeLightbox"
    />
  </article>
</template>

<style scoped>
/* 圖片切換動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
