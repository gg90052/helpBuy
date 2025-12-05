<script setup>
import { ref } from "vue";
import { useCart } from "../composables/useCart";

const { cartCount } = useCart();

const isMenuOpen = ref(false);

defineProps({
  currentView: {
    type: String,
    default: "home",
  },
});

const emit = defineEmits(["navigate"]);

const navItems = [
  { name: "首頁", view: "home" },
  { name: "商品", href: "#products" },
  { name: "管理", view: "admin" },
];

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleNavClick = (item) => {
  closeMenu();
  if (item.view) {
    emit("navigate", item.view);
  } else if (item.href) {
    emit("navigate", "home");
    // 延遲滾動以確保頁面已切換
    setTimeout(() => {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }
};

const goToCart = () => {
  closeMenu();
  emit("navigate", "cart");
};

const goHome = () => {
  closeMenu();
  emit("navigate", "home");
};
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-light-gray"
  >
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <button @click="goHome" class="flex items-center gap-2 cursor-pointer">
          <span class="text-xl font-medium text-charcoal">
            Teddy的<span class="text-sakura-dark">日本</span>代購
          </span>
        </button>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="handleNavClick(item)"
            class="text-warm-gray hover:text-charcoal transition-colors duration-200 text-sm tracking-wide"
          >
            {{ item.name }}
          </button>

          <!-- Cart Button -->
          <button
            @click="goToCart"
            class="relative flex items-center gap-1 text-warm-gray hover:text-charcoal transition-colors duration-200"
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span class="text-sm">購物清單</span>
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 w-5 h-5 bg-sakura-dark text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ cartCount > 99 ? "99+" : cartCount }}
            </span>
          </button>
        </div>

        <!-- Mobile: Cart + Menu Button -->
        <div class="md:hidden flex items-center gap-3">
          <!-- Cart Button -->
          <button @click="goToCart" class="relative p-2 text-charcoal">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute top-0 right-0 w-5 h-5 bg-sakura-dark text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ cartCount > 99 ? "99+" : cartCount }}
            </span>
          </button>

          <!-- Menu Button -->
          <button
            @click="toggleMenu"
            class="p-2 text-charcoal"
            aria-label="切換選單"
          >
            <svg
              v-if="!isMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        class="md:hidden bg-cream border-b border-light-gray"
      >
        <div class="px-4 py-4 space-y-3">
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="handleNavClick(item)"
            class="block w-full text-left py-2 text-warm-gray hover:text-charcoal transition-colors duration-200"
          >
            {{ item.name }}
          </button>
          <button
            @click="goToCart"
            class="block w-full text-left py-2 text-warm-gray hover:text-charcoal transition-colors duration-200"
          >
            購物清單 ({{ cartCount }})
          </button>
        </div>
      </div>
    </transition>
  </nav>
</template>
