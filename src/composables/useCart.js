import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'helpbuy_cart'

// 從 localStorage 載入購物車資料
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('載入購物車資料失敗:', error)
  }
  return []
}

// 儲存購物車資料到 localStorage
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('儲存購物車資料失敗:', error)
  }
}

const cartItems = ref(loadCartFromStorage())

// 監聽購物車變化，自動儲存到 localStorage
watch(
  cartItems,
  (newItems) => {
    saveCartToStorage(newItems)
  },
  { deep: true }
)

export function useCart() {
  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        image: product.images?.[0] || null,
        quantity: quantity
      })
    }
  }

  const removeFromCart = (productId) => {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = () => {
    cartItems.value = []
    // 清除 localStorage
    localStorage.removeItem(STORAGE_KEY)
  }

  const cartCount = computed(() => {
    return cartItems.value.reduce((count, item) => count + item.quantity, 0)
  })

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount
  }
}
