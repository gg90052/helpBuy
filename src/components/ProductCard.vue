<script setup>
import { ref, computed } from 'vue'
import { useCart } from '../composables/useCart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const { addToCart } = useCart()

const currentImageIndex = ref(0)
const quantity = ref(1)
const showAdded = ref(false)

const hasMultipleImages = computed(() => props.product.images.length > 1)

const nextImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.product.images.length
  }
}

const prevImage = () => {
  if (hasMultipleImages.value) {
    currentImageIndex.value = currentImageIndex.value === 0
      ? props.product.images.length - 1
      : currentImageIndex.value - 1
  }
}

const goToImage = (index) => {
  currentImageIndex.value = index
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('zh-TW').format(price)
}

const increaseQty = () => {
  quantity.value++
}

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = () => {
  addToCart(props.product, quantity.value)
  showAdded.value = true
  setTimeout(() => {
    showAdded.value = false
  }, 1500)
  quantity.value = 1
}
</script>

<template>
  <article class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group">
    <!-- Image Container -->
    <div class="relative aspect-square overflow-hidden bg-light-gray">
      <!-- Images -->
      <div class="relative w-full h-full">
        <img
          v-for="(image, index) in product.images"
          :key="index"
          :src="image"
          :alt="`${product.name} - 圖片 ${index + 1}`"
          :class="[
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          ]"
          loading="lazy"
        />
      </div>

      <!-- Navigation Arrows (only show if multiple images) -->
      <template v-if="hasMultipleImages">
        <button
          @click.stop="prevImage"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="上一張圖片"
        >
          <svg class="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click.stop="nextImage"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="下一張圖片"
        >
          <svg class="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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
                : 'bg-white/70 hover:bg-white'
            ]"
            :aria-label="`前往圖片 ${index + 1}`"
          />
        </div>
      </template>

      <!-- Category Badge -->
      <span class="absolute top-3 left-3 px-3 py-1 bg-cream/90 backdrop-blur-sm rounded-full text-xs text-charcoal">
        {{ product.category }}
      </span>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-medium text-charcoal mb-1 line-clamp-1">
        {{ product.name }}
      </h3>
      <p class="text-sm text-warm-gray mb-3 line-clamp-3 h-[3.75rem]">
        {{ product.description }}
      </p>
      <p class="text-lg font-medium text-sakura-dark mb-3">
        NT$ {{ formatPrice(product.price) }}
      </p>

      <!-- Quantity Selector -->
      <div class="flex items-center gap-2 mb-3">
        <span class="text-sm text-warm-gray">數量</span>
        <div class="flex items-center border border-light-gray rounded-lg">
          <button
            @click="decreaseQty"
            class="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-light-gray transition-colors"
            :disabled="quantity <= 1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <span class="w-8 text-center text-sm font-medium">{{ quantity }}</span>
          <button
            @click="increaseQty"
            class="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-light-gray transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add to Cart Button -->
      <button
        @click="handleAddToCart"
        :class="[
          'w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
          showAdded
            ? 'bg-matcha text-charcoal'
            : 'bg-charcoal text-cream hover:bg-charcoal/90'
        ]"
      >
        {{ showAdded ? '已加入購物清單 ✓' : '加入購物清單' }}
      </button>
    </div>
  </article>
</template>
