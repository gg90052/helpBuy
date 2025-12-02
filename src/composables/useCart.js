import { ref, computed } from 'vue'

const cartItems = ref([])

export function useCart() {
  const addToCart = (product, quantity = 1) => {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
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
  }

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  })

  const cartCount = computed(() => {
    return cartItems.value.reduce((count, item) => count + item.quantity, 0)
  })

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  }
}

