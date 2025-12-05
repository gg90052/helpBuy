<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const currentIndex = ref(props.initialIndex);
const isTransitioning = ref(false);

// 觸摸滑動相關
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);
const swipeThreshold = 50; // 滑動閾值（像素）

const hasMultipleImages = computed(() => props.images.length > 1);

// 監聽 visible 變化，重置索引
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      currentIndex.value = props.initialIndex;
    }
  }
);

// 監聽 initialIndex 變化
watch(
  () => props.initialIndex,
  (newVal) => {
    currentIndex.value = newVal;
  }
);

const nextImage = () => {
  if (hasMultipleImages.value && !isTransitioning.value) {
    isTransitioning.value = true;
    currentIndex.value = (currentIndex.value + 1) % props.images.length;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 300);
  }
};

const prevImage = () => {
  if (hasMultipleImages.value && !isTransitioning.value) {
    isTransitioning.value = true;
    currentIndex.value =
      currentIndex.value === 0
        ? props.images.length - 1
        : currentIndex.value - 1;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 300);
  }
};

const goToImage = (index) => {
  if (!isTransitioning.value && index !== currentIndex.value) {
    isTransitioning.value = true;
    currentIndex.value = index;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 300);
  }
};

const handleClose = () => {
  emit("close");
};

const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    handleClose();
  }
};

// 觸摸事件處理
const handleTouchStart = (e) => {
  if (!hasMultipleImages.value || isTransitioning.value) return;
  const touch = e.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
};

const handleTouchMove = (e) => {
  // 允許滑動，但不做任何視覺反饋
  e.preventDefault();
};

const handleTouchEnd = (e) => {
  if (!hasMultipleImages.value || isTransitioning.value) return;
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

// 鍵盤事件處理
const handleKeydown = (e) => {
  if (!props.visible) return;

  switch (e.key) {
    case "Escape":
      handleClose();
      break;
    case "ArrowLeft":
      e.preventDefault();
      prevImage();
      break;
    case "ArrowRight":
      e.preventDefault();
      nextImage();
      break;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <!-- 關閉按鈕 -->
        <button
          @click="handleClose"
          class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="關閉"
        >
          <svg
            class="w-5 h-5 text-charcoal"
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

        <!-- 左箭頭 - 固定在畫面左側 -->
        <button
          v-if="hasMultipleImages"
          @click.stop="prevImage"
          class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-10"
          aria-label="上一張圖片"
        >
          <svg
            class="w-5 h-5 md:w-6 md:h-6 text-charcoal"
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

        <!-- 圖片容器 -->
        <div
          class="relative flex items-center justify-center p-4 md:p-8 pointer-events-none"
        >
          <div
            class="relative max-w-7xl max-h-full flex items-center justify-center pointer-events-auto"
          >
            <!-- 圖片容器 - 使用固定尺寸避免跳動 -->
            <div
              class="relative w-full max-w-full min-h-[50vh] max-h-[90vh] flex items-center justify-center touch-none"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
              @click.stop
            >
              <Transition name="image-slide" mode="out-in">
                <img
                  :key="`${images[currentIndex]}-${currentIndex}`"
                  :src="images[currentIndex]"
                  :alt="`圖片 ${currentIndex + 1}`"
                  class="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
                  @click.stop
                  draggable="false"
                />
              </Transition>
            </div>
          </div>
        </div>

        <!-- 右箭頭 - 固定在畫面右側 -->
        <button
          v-if="hasMultipleImages"
          @click.stop="nextImage"
          class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-10"
          aria-label="下一張圖片"
        >
          <svg
            class="w-5 h-5 md:w-6 md:h-6 text-charcoal"
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

        <!-- 圖片指示器 -->
        <div
          v-if="hasMultipleImages"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
        >
          <button
            v-for="(_, index) in images"
            :key="index"
            @click.stop="goToImage(index)"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'bg-cream w-6'
                : 'bg-white/60 hover:bg-white/80',
            ]"
            :aria-label="`前往圖片 ${index + 1}`"
          />
        </div>

        <!-- 圖片計數器 -->
        <div
          v-if="hasMultipleImages"
          class="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-charcoal"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Lightbox 進入/離開動畫 */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* 圖片切換動畫 */
.image-slide-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.image-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.image-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.image-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.image-slide-enter-to,
.image-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
