<script setup>
defineProps({
  faqs: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <section id="faq" class="py-20 bg-light-gray/50">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <p class="text-warm-gray text-sm tracking-[0.2em] mb-2">FAQ</p>
        <h2 class="text-3xl md:text-4xl font-light text-charcoal">
          常見<span class="font-medium text-sakura-dark">問題</span>
        </h2>
      </div>

      <!-- FAQ Items -->
      <div class="space-y-4">
        <div
          v-for="faq in faqs"
          :key="faq.id"
          class="bg-white rounded-xl overflow-hidden shadow-sm p-6"
        >
          <h3 class="font-medium text-charcoal mb-3">
            {{ faq.question }}
          </h3>
          <p class="text-warm-gray leading-relaxed">
            {{ faq.answer }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
