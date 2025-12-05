<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "cancel", "addCategory"]);

// 圖片上傳 API 設定
const IMAGE_UPLOAD_API = import.meta.env.VITE_IMAGE_UPLOAD_API;
const IMAGE_UPLOAD_AUTH = import.meta.env.VITE_IMAGE_UPLOAD_AUTH;

// 表單資料
const form = ref({
  name: "",
  price: "",
  category_id: "",
  description: "",
  images: [],
  is_visible: true,
});

// 新圖片網址輸入
const newImageUrl = ref("");

// 圖片上傳相關
const fileInputRef = ref(null);
const uploading = ref(false);
const uploadError = ref("");

// 新類別輸入
const showNewCategoryInput = ref(false);
const newCategoryName = ref("");

// 是否為編輯模式
const isEditMode = computed(() => !!props.product);

// 監聽 product 變化，填入表單
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      form.value = {
        name: newProduct.name || "",
        price: newProduct.price || "",
        category_id: newProduct.category_id || newProduct.categories?.id || "",
        description: newProduct.description || "",
        images: Array.isArray(newProduct.images) ? [...newProduct.images] : [],
        is_visible:
          newProduct.is_visible !== undefined ? newProduct.is_visible : true,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// 重置表單
const resetForm = () => {
  form.value = {
    name: "",
    price: "",
    category_id: "",
    description: "",
    images: [],
    is_visible: true,
  };
  newImageUrl.value = "";
  showNewCategoryInput.value = false;
  newCategoryName.value = "";
};

// 新增圖片網址
const addImageUrl = () => {
  const url = newImageUrl.value.trim();
  if (url && !form.value.images.includes(url)) {
    form.value.images.push(url);
    newImageUrl.value = "";
  }
};

// 移除圖片
const removeImage = (index) => {
  form.value.images.splice(index, 1);
};

// 觸發檔案選擇
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 處理檔案選擇
const handleFileSelect = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  uploadError.value = "";

  for (const file of files) {
    // 檢查是否為圖片
    if (!file.type.startsWith("image/")) {
      uploadError.value = `${file.name} 不是有效的圖片檔案`;
      continue;
    }

    // 檢查檔案大小 (限制 10MB)
    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = `${file.name} 檔案過大，請選擇 10MB 以下的圖片`;
      continue;
    }

    await uploadImage(file);
  }

  // 清空 input 以便可以重複選擇同一檔案
  event.target.value = "";
};

// 上傳圖片到 API
const uploadImage = async (file) => {
  uploading.value = true;
  uploadError.value = "";

  try {
    const response = await fetch(IMAGE_UPLOAD_API, {
      method: "PUT",
      headers: {
        "X-Custom-Auth": IMAGE_UPLOAD_AUTH,
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`上傳失敗: ${response.status}`);
    }

    const responseData = await response.json();
    const imageUrl = responseData.url;

    if (imageUrl && !form.value.images.includes(imageUrl)) {
      form.value.images.push(imageUrl);
    }
  } catch (err) {
    console.error("圖片上傳錯誤:", err);
    uploadError.value = `上傳失敗: ${err.message}`;
  } finally {
    uploading.value = false;
  }
};

// 新增類別
const handleAddCategory = async () => {
  const name = newCategoryName.value.trim();
  if (name) {
    emit("addCategory", name);
    newCategoryName.value = "";
    showNewCategoryInput.value = false;
  }
};

// 提交表單
const handleSubmit = () => {
  // 基本驗證
  if (!form.value.name.trim()) {
    alert("請輸入商品名稱");
    return;
  }
  if (!form.value.price || form.value.price <= 0) {
    alert("請輸入有效的價格");
    return;
  }
  if (!form.value.category_id) {
    alert("請選擇類別");
    return;
  }

  emit("submit", {
    name: form.value.name.trim(),
    price: parseInt(form.value.price, 10),
    category_id: parseInt(form.value.category_id, 10),
    description: form.value.description.trim(),
    images: form.value.images,
    is_visible: form.value.is_visible,
  });
};

// 取消
const handleCancel = () => {
  resetForm();
  emit("cancel");
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5">
    <!-- 商品名稱 -->
    <div>
      <label class="block text-sm font-medium text-charcoal mb-1.5">
        商品名稱 <span class="text-red-500">*</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        placeholder="請輸入商品名稱"
        class="w-full px-4 py-3 sm:py-2.5 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura focus:border-transparent transition-all text-base"
        required
      />
    </div>

    <!-- 價格 -->
    <div>
      <label class="block text-sm font-medium text-charcoal mb-1.5">
        參考售價 (￥) <span class="text-red-500">*(輸入1為無售價)</span>
      </label>
      <input
        v-model="form.price"
        type="number"
        min="1"
        inputmode="numeric"
        placeholder="請輸入價格"
        class="w-full px-4 py-3 sm:py-2.5 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura focus:border-transparent transition-all text-base"
        required
      />
    </div>

    <!-- 類別 -->
    <div>
      <label class="block text-sm font-medium text-charcoal mb-1.5">
        類別 <span class="text-red-500">*</span>
      </label>
      <div class="flex gap-2">
        <select
          v-model="form.category_id"
          class="flex-1 px-4 py-3 sm:py-2.5 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura focus:border-transparent transition-all bg-white text-base"
          required
        >
          <option value="" disabled>請選擇類別</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
        <button
          type="button"
          @click="showNewCategoryInput = !showNewCategoryInput"
          class="px-4 py-3 sm:py-2.5 bg-soft-gray hover:bg-light-gray text-charcoal rounded-lg transition-colors"
          title="新增類別"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <!-- 新增類別輸入 -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showNewCategoryInput" class="mt-2 flex gap-2">
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="輸入新類別名稱"
            class="flex-1 px-4 py-2.5 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura focus:border-transparent transition-all text-base"
            @keyup.enter="handleAddCategory"
          />
          <button
            type="button"
            @click="handleAddCategory"
            class="px-4 py-2.5 bg-sakura-dark hover:bg-sakura-dark/90 text-white rounded-lg transition-colors"
          >
            新增
          </button>
        </div>
      </transition>
    </div>

    <!-- 描述 -->
    <div>
      <label class="block text-sm font-medium text-charcoal mb-1.5">
        商品描述
      </label>
      <textarea
        v-model="form.description"
        placeholder="請輸入商品描述"
        rows="3"
        class="w-full px-4 py-3 sm:py-2.5 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura focus:border-transparent transition-all resize-none text-base"
      ></textarea>
    </div>

    <!-- 顯示狀態 -->
    <div>
      <label class="block text-sm font-medium text-charcoal mb-1.5">
        顯示狀態
      </label>
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="form.is_visible = !form.is_visible"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sakura focus:ring-offset-2"
          :class="form.is_visible ? 'bg-sakura-dark' : 'bg-light-gray'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="form.is_visible ? 'translate-x-6' : 'translate-x-1'"
          ></span>
        </button>
        <span class="text-sm text-warm-gray">
          {{ form.is_visible ? "顯示在前端" : "隱藏（不顯示在前端）" }}
        </span>
      </div>
    </div>

    <!-- 圖片 -->
    <div>
      <label class="block text-sm font-medium text-charcoal mb-1.5">
        商品圖片
      </label>

      <!-- 已新增的圖片 -->
      <div v-if="form.images.length > 0" class="mb-3 space-y-2">
        <div
          v-for="(url, index) in form.images"
          :key="index"
          class="flex items-center gap-2 p-2 bg-soft-gray rounded-lg"
        >
          <img
            :src="url"
            :alt="`圖片 ${index + 1}`"
            class="w-12 h-12 object-cover rounded"
            @error="(e) => (e.target.src = 'https://via.placeholder.com/48')"
          />
          <span class="flex-1 text-sm text-warm-gray truncate">{{ url }}</span>
          <button
            type="button"
            @click="removeImage(index)"
            class="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="移除圖片"
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
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 新增圖片網址 -->
      <div class="flex gap-2">
        <input
          v-model="newImageUrl"
          type="url"
          placeholder="輸入圖片網址 (https://...)"
          class="flex-1 px-4 py-3 sm:py-2.5 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura focus:border-transparent transition-all text-base"
          @keyup.enter.prevent="addImageUrl"
        />
        <button
          type="button"
          @click="addImageUrl"
          class="px-4 py-3 sm:py-2.5 bg-soft-gray hover:bg-light-gray text-charcoal rounded-lg transition-colors"
        >
          新增
        </button>
      </div>

      <!-- 隱藏的檔案輸入 -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- 上傳按鈕 -->
      <div class="mt-2">
        <button
          type="button"
          @click="triggerFileInput"
          :disabled="uploading"
          class="w-full px-4 py-3 sm:py-2.5 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2"
          :class="
            uploading
              ? 'border-light-gray text-warm-gray cursor-not-allowed'
              : 'border-sakura hover:border-sakura-dark hover:bg-sakura/5 text-sakura-dark cursor-pointer'
          "
        >
          <!-- 上傳中動畫 -->
          <svg
            v-if="uploading"
            class="w-5 h-5 animate-spin"
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
          <!-- 上傳圖示 -->
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="text-sm">{{
            uploading ? "上傳中..." : "點擊上傳圖片"
          }}</span>
        </button>
      </div>

      <!-- 上傳錯誤訊息 -->
      <p v-if="uploadError" class="mt-2 text-sm text-red-500">
        {{ uploadError }}
      </p>
    </div>

    <!-- 按鈕 -->
    <div class="flex gap-3 pt-4 border-t border-light-gray">
      <button
        type="button"
        @click="handleCancel"
        class="flex-1 px-4 py-3 sm:py-2.5 bg-soft-gray hover:bg-light-gray text-charcoal rounded-lg transition-colors font-medium"
        :disabled="loading"
      >
        取消
      </button>
      <button
        type="submit"
        class="flex-1 px-4 py-3 sm:py-2.5 bg-sakura-dark hover:bg-sakura-dark/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        :disabled="loading"
      >
        <svg
          v-if="loading"
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
        {{ isEditMode ? "更新商品" : "新增商品" }}
      </button>
    </div>
  </form>
</template>
