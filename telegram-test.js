const axios = require('axios')

const BOT_TOKEN = '8709624271:AAEjme1b1y7t19Ljy3l1NruM7XOFkSJ2o6c' // вставь сюда свой реальный токен
const CHAT_ID = '1056281117'

// функция отправки
async function sendTelegram(order) {
  if (order.totalSumm > 50000) {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: `🔥 Новый большой заказ!
💰 Сумма: ${order.totalSumm}
📦 Номер: ${order.number}`
      }
    )

    console.log('Отправлено в Telegram')
  }
}
sendTelegram({
  totalSumm: 60000,
  number: 'TEST-123'
})
