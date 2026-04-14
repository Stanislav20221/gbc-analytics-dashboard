const axios = require('axios')
const { createClient } = require('@supabase/supabase-js')

const RETAILCRM_URL = 'https://staspisarevsky.retailcrm.ru'
const RETAILCRM_API_KEY = 'GXtSivncvzKC4ukNJzw81YspqNjY3Eny'

const SUPABASE_URL = 'https://ppawsqstspjihzgxbwhx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYXdzcXN0c3BqaWh6Z3hid2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzI4NjQsImV4cCI6MjA5MTcwODg2NH0.34ZaPLEtPbsbOFJUE1C27b6AhGStK3HqpgktS7HxIZk'

const BOT_TOKEN = '8709624271:AAEjme1b1y7t19Ljy3l1NruM7XOFkSJ2o6c'
const CHAT_ID = '1056281117'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function sendTelegram(order) {
  if (Number(order.totalSumm) > 50000) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text: `🔥 Новый большой заказ!
📦 Номер: ${order.number}
💰 Сумма: ${order.totalSumm}
👤 Клиент: ${order.firstName || ''} ${order.lastName || ''}`.trim()
        }
      )
      console.log(`Отправлено уведомление по заказу ${order.number}`)
    } catch (error) {
      console.error(`Ошибка Telegram для заказа ${order.number}:`, error.message)
    }
  }
}

async function fetchOrders() {
  const response = await axios.get(`${RETAILCRM_URL}/api/v5/orders`, {
    params: {
      apiKey: RETAILCRM_API_KEY,
      limit: 100
    }
  })

  return response.data.orders || []
}

function mapOrder(order) {
  return {
    id: order.id,
    number: order.number,
    external_id: order.externalId || null,
    created_at: order.createdAt || null,
    status: order.status || null,
    order_type: order.orderType || null,
    order_method: order.orderMethod || null,
    first_name: order.firstName || null,
    last_name: order.lastName || null,
    phone: order.phone || null,
    email: order.email || null,
    total_sum: Number(order.totalSumm || 0),
    site: order.site || null,
    customer_comment: order.customerComment || null
  }
}

async function syncOrders() {
  try {
    const orders = await fetchOrders()
    console.log(`Получено заказов из RetailCRM: ${orders.length}`)

    for (const order of orders) {
      const mapped = mapOrder(order)

      const { error } = await supabase
        .from('orders')
        .upsert(mapped, { onConflict: 'id' })

      if (error) {
        console.error(`Ошибка записи заказа ${order.number}:`, error.message)
        continue
      }

      console.log(`Синхронизирован заказ ${order.number}`)
      await sendTelegram(order)
    }

    console.log('✅ Синхронизация завершена')
  } catch (error) {
    console.error('Ошибка синхронизации:')
    console.error(error.response?.data || error.message)
  }
}

syncOrders()