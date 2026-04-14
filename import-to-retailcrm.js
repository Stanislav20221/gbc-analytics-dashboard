const axios = require('axios')
const orders = require('./mock_orders.json')

const RETAILCRM_URL = 'https://staspisarevsky.retailcrm.ru'
const RETAILCRM_API_KEY = 'GXtSivncvzKC4ukNJzw81YspqNjY3Eny'
const SITE = 'staspisarevsky'

function calcTotalSumm(items = []) {
  return items.reduce((sum, item) => {
    const qty = Number(item.quantity || 0)
    const price = Number(item.initialPrice || 0)
    return sum + qty * price
  }, 0)
}

function mapOrder(order, index) {
  const totalSumm = calcTotalSumm(order.items)

  return {
    externalId: `mock-${index + 1}`,
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    email: order.email,
    status: order.status || 'new',
    site: SITE,
    number: `MOCK-${index + 1}`,
    items: (order.items || []).map((item) => ({
      initialPrice: Number(item.initialPrice),
      quantity: Number(item.quantity),
      productName: item.productName
    })),
    delivery: {
      address: {
        city: order.delivery?.address?.city || '',
        text: order.delivery?.address?.text || ''
      }
    },
    customerComment: `UTM source: ${order.customFields?.utm_source || 'unknown'}`,
    totalSumm
  }
}

async function createOrder(orderData) {
  const body = new URLSearchParams()
  body.append('apiKey', RETAILCRM_API_KEY)
  body.append('site', SITE)
  body.append('order', JSON.stringify(orderData))

  const response = await axios.post(
    `${RETAILCRM_URL}/api/v5/orders/create`,
    body.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  return response.data
}

async function importOrders() {
  console.log(`Найдено заказов: ${orders.length}`)

  for (let i = 0; i < orders.length; i++) {
    const mapped = mapOrder(orders[i], i)

    try {
      const result = await createOrder(mapped)
      console.log(`✅ Импортирован заказ ${mapped.number}`, result)
    } catch (error) {
      console.error(`❌ Ошибка на заказе ${mapped.number}`)
      console.error(error.response?.data || error.message)
    }
  }
}

importOrders()