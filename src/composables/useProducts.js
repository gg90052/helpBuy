import { ref, onMounted } from 'vue'

const productsData = ref(null)
const loading = ref(false)
const error = ref(null)

export function useProducts(googleSheetsUrl) {
  const fetchProducts = async () => {
    if (!googleSheetsUrl || googleSheetsUrl === 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
      error.value = '請設定 Google Sheets API URL'
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(googleSheetsUrl)
      
      if (!response.ok) {
        throw new Error(`無法載入資料: ${response.status}`)
      }

      const data = await response.json()
      
      // 檢查是否有錯誤訊息
      if (data.error) {
        throw new Error(data.error)
      }
      
      // 確保資料結構正確（只包含 categories 和 products）
      productsData.value = {
        categories: data.categories || [],
        products: data.products || []
      }
    } catch (err) {
      error.value = err.message || '載入商品資料時發生錯誤'
      console.error('載入商品資料錯誤:', err)
      productsData.value = null
    } finally {
      loading.value = false
    }
  }

  // 在組件掛載時自動載入資料
  onMounted(() => {
    if (googleSheetsUrl) {
      fetchProducts()
    }
  })

  return {
    productsData,
    loading,
    error,
    fetchProducts
  }
}

