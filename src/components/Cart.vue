<script setup>
import { useCart } from "../composables/useCart";

const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

const emit = defineEmits(["goToProducts"]);

const handleGoToProducts = () => {
  emit("goToProducts");
};
</script>

<template>
  <section id="cart" class="py-12 sm:py-20 bg-cream min-h-screen">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-8 sm:mb-12">
        <p class="text-warm-gray text-sm tracking-[0.2em] mb-2">CART</p>
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-light text-charcoal">
          購物<span class="font-medium text-sakura-dark">清單</span>
        </h2>
      </div>

      <!-- Empty Cart -->
      <div v-if="cartItems.length === 0" class="text-center py-16">
        <div
          class="w-20 h-20 mx-auto mb-4 bg-light-gray rounded-full flex items-center justify-center"
        >
          <svg
            class="w-10 h-10 text-warm-gray"
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
        </div>
        <p class="text-warm-gray mb-4">購物清單是空的</p>
        <button
          @click="handleGoToProducts"
          class="inline-block px-6 py-2.5 bg-charcoal text-cream rounded-full text-sm hover:bg-charcoal/90 transition-colors"
        >
          去逛逛商品
        </button>
      </div>

      <!-- Cart Content -->
      <div v-else>
        <div class="bg-cream">
          <!-- 手機版：緊湊卡片列表 -->
          <div class="sm:hidden space-y-2">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="bg-white rounded-xl shadow-sm p-2.5"
            >
              <div class="flex gap-2">
                <!-- 商品圖片 -->
                <img
                  :src="item.image || 'https://via.placeholder.com/48'"
                  :alt="item.name"
                  class="w-12 h-12 object-cover rounded-lg bg-soft-gray shrink-0"
                  @error="
                    (e) => (e.target.src = 'https://via.placeholder.com/48')
                  "
                />

                <!-- 商品資訊 -->
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start gap-1">
                    <h3
                      class="font-medium text-charcoal text-sm leading-snug line-clamp-2"
                    >
                      {{ item.name }}
                    </h3>
                    <button
                      @click="removeFromCart(item.id)"
                      class="p-1 text-warm-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <!-- 數量控制 -->
                  <div class="flex items-center gap-1.5 mt-1">
                    <button
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      class="w-6 h-6 flex items-center justify-center border border-light-gray rounded hover:bg-light-gray transition-colors"
                    >
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span class="w-6 text-center text-sm font-medium">{{
                      item.quantity
                    }}</span>
                    <button
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      class="w-6 h-6 flex items-center justify-center border border-light-gray rounded hover:bg-light-gray transition-colors"
                    >
                      <svg
                        class="w-3 h-3"
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
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 桌面版：表格 -->
          <div
            class="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <table class="w-full">
              <thead class="bg-light-gray/50">
                <tr>
                  <th
                    class="px-4 py-4 text-left text-sm font-medium text-charcoal"
                  >
                    商品名稱
                  </th>
                  <th
                    class="px-4 py-4 text-center text-sm font-medium text-charcoal"
                  >
                    數量
                  </th>
                  <th
                    class="px-4 py-4 text-center text-sm font-medium text-charcoal w-16"
                  >
                    刪除
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-light-gray">
                <tr v-for="item in cartItems" :key="item.id">
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <img
                        :src="item.image || 'https://via.placeholder.com/48'"
                        :alt="item.name"
                        class="w-12 h-12 object-cover rounded-lg bg-soft-gray shrink-0"
                        @error="
                          (e) =>
                            (e.target.src = 'https://via.placeholder.com/48')
                        "
                      />
                      <span class="text-charcoal">{{ item.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        @click="updateQuantity(item.id, item.quantity - 1)"
                        class="w-7 h-7 flex items-center justify-center border border-light-gray rounded hover:bg-light-gray transition-colors"
                      >
                        <svg
                          class="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span class="w-8 text-center text-sm">{{
                        item.quantity
                      }}</span>
                      <button
                        @click="updateQuantity(item.id, item.quantity + 1)"
                        class="w-7 h-7 flex items-center justify-center border border-light-gray rounded hover:bg-light-gray transition-colors"
                      >
                        <svg
                          class="w-3 h-3"
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
                      </button>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <button
                      @click="removeFromCart(item.id)"
                      class="text-warm-gray hover:text-red-500 transition-colors"
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="mt-4 flex justify-center">
          <button
            @click="clearCart"
            class="px-4 py-2.5 text-sm text-warm-gray hover:text-red-500 transition-colors"
          >
            清空購物清單
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
