<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  },
  activeCategory: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:activeCategory'])

const selectCategory = (category) => {
  emit('update:activeCategory', category)
}
</script>

<template>
  <div class="overflow-x-auto hide-scrollbar -mx-4 px-4">
    <div class="flex gap-2 md:gap-3 pb-2 min-w-max md:justify-center">
      <button
        v-for="category in categories"
        :key="category"
        @click="selectCategory(category)"
        :class="[
          'px-5 py-2.5 rounded-full text-sm transition-all duration-300 whitespace-nowrap',
          activeCategory === category
            ? 'bg-charcoal text-cream shadow-md'
            : 'bg-light-gray text-warm-gray hover:bg-sakura/30 hover:text-charcoal'
        ]"
      >
        {{ category }}
      </button>
    </div>
  </div>
</template>

