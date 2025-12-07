<script setup>
import { ref } from "vue";
import { useCart } from "../composables/useCart";
// html2canvas 改為動態載入，減少首屏載入時間

const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

const emit = defineEmits(["goToProducts"]);

// 截圖相關
const cartRef = ref(null);
const isSaving = ref(false);
const showPrintHeader = ref(false);

const handleGoToProducts = () => {
  emit("goToProducts");
};

// 儲存為圖片（動態載入 html2canvas）
const saveAsImage = async () => {
  if (!cartRef.value || isSaving.value) return;

  isSaving.value = true;
  showPrintHeader.value = true;

  // 等待 DOM 更新
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    // 動態載入 html2canvas，只在需要時才載入
    const html2canvas = (await import("html2canvas")).default;
    
    const canvas = await html2canvas(cartRef.value, {
      backgroundColor: "#FAF8F5", // cream 背景色
      scale: 2, // 提高解析度
      useCORS: true,
      logging: false,
    });

    // 轉換為圖片並下載
    const link = document.createElement("a");
    link.download = `購物清單_${new Date()
      .toLocaleDateString("zh-TW")
      .replace(/\//g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    console.error("儲存圖片失敗:", error);
    alert("儲存圖片失敗，請重試");
  } finally {
    showPrintHeader.value = false;
    isSaving.value = false;
  }
};

// 取得今天日期
const getToday = () => {
  return new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
        <!-- 截圖區域 -->
        <div ref="cartRef" class="bg-cream p-1">
          <!-- 截圖用標題（只在截圖時可見） -->
          <div v-if="showPrintHeader" class="text-center pb-4 mb-2">
            <h3 class="text-xl font-medium text-charcoal">
              日本代購 - 購物清單
            </h3>
            <p class="text-sm text-warm-gray mt-1">{{ getToday() }}</p>
          </div>

          <!-- 手機版：卡片列表 -->
          <div class="sm:hidden space-y-3">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="bg-white rounded-xl shadow-sm p-4"
            >
              <div class="flex gap-3">
                <!-- 商品圖片 -->
                <img
                  :src="item.image || 'https://via.placeholder.com/64'"
                  :alt="item.name"
                  class="w-16 h-16 object-cover rounded-lg bg-soft-gray flex-shrink-0"
                  @error="
                    (e) => (e.target.src = 'https://via.placeholder.com/64')
                  "
                />

                <!-- 商品資訊 -->
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start gap-2">
                    <h3 class="font-medium text-charcoal text-sm leading-snug">
                      {{ item.name }}
                    </h3>
                    <!-- 截圖時隱藏刪除按鈕 -->
                    <button
                      v-if="!showPrintHeader"
                      @click="removeFromCart(item.id)"
                      class="p-1 text-warm-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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
                </div>
              </div>

              <div
                class="flex items-center justify-between mt-3 pt-3 border-t border-light-gray"
              >
                <!-- 數量控制 - 截圖時只顯示數量 -->
                <div v-if="!showPrintHeader" class="flex items-center gap-2">
                  <button
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    class="w-8 h-8 flex items-center justify-center border border-light-gray rounded-lg hover:bg-light-gray transition-colors"
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
                  <span class="w-8 text-center font-medium">{{
                    item.quantity
                  }}</span>
                  <button
                    @click="updateQuantity(item.id, item.quantity + 1)"
                    class="w-8 h-8 flex items-center justify-center border border-light-gray rounded-lg hover:bg-light-gray transition-colors"
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
                <span v-else class="text-sm text-warm-gray"
                  >× {{ item.quantity }}</span
                >
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
                    v-if="!showPrintHeader"
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
                        class="w-12 h-12 object-cover rounded-lg bg-soft-gray flex-shrink-0"
                        @error="
                          (e) =>
                            (e.target.src = 'https://via.placeholder.com/48')
                        "
                      />
                      <span class="text-charcoal">{{ item.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <!-- 截圖模式：只顯示數字 -->
                    <div v-if="showPrintHeader" class="text-center text-sm">
                      {{ item.quantity }}
                    </div>
                    <!-- 正常模式：數量控制 -->
                    <div v-else class="flex items-center justify-center gap-1">
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
                  <td v-if="!showPrintHeader" class="px-4 py-4 text-center">
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
        <div
          class="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center"
        >
          <button
            @click="clearCart"
            class="order-2 sm:order-1 px-4 py-2.5 text-sm text-warm-gray hover:text-red-500 transition-colors text-center sm:text-left"
          >
            清空購物清單
          </button>

          <button
            @click="saveAsImage"
            :disabled="isSaving"
            class="order-1 sm:order-2 w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-sakura-dark hover:bg-sakura-dark/90 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="isSaving"
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ isSaving ? "儲存中..." : "儲存為圖片" }}
          </button>
        </div>

        <!-- 提示文字 -->
        <p class="text-center text-sm text-warm-gray mt-6">
          儲存圖片後請傳給我，會跟你確認價格
        </p>
      </div>
    </div>
  </section>
</template>
