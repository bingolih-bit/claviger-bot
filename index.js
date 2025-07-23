require('dotenv').config();
const axios = require('axios');
const express = require('express');
const schedule = require('node-schedule');

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Telegram mesaj gönderme fonksiyonu
async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Telegram mesaj gönderme hatası:', error.message);
  }
}

// Resmî Gazete RSS başlıklarını çek ve Telegram’a gönder
async function sendResmiGazeteOzet() {
  try {
    const rssUrl = 'https://www.resmigazete.gov.tr/rss.xml';
    const response = await axios.get(rssUrl);
    const xmlData = response.data;

    // Basit başlık çıkarma (regex ile)
    const titles = [...xmlData.matchAll(/<title>(.*?)<\/title>/g)]
      .slice(1, 4)  // İlk <title> RSS başlığı olduğu için atlanır, sonraki 3 başlık alınır
      .map(match => match[1]);

    let mesaj = `📌 *Resmî Gazete Başlıkları*\n\n`;
    titles.forEach((title, i) => {
      mesaj += `${i + 1}. ${title}\n`;
    });
    mesaj += `\n📎 Detaylı için: https://www.resmigazete.gov.tr`;

    await sendTelegramMessage(mesaj);
    console.log('Resmî Gazete özet mesajı gönderildi.');
  } catch (error) {
    console.error('Resmî Gazete özet gönderme hatası:', error.message);
  }
}

// Her sabah saat 09:00’da çalıştır
schedule.scheduleJob('0 9 * * *', sendResmiGazeteOzet);

app.listen(PORT, () => {
  console.log(`Bot ${PORT} portunda çalışıyor ve zamanlayıcı aktif.`);
});
module.exports = {
  sendResmiGazeteOzet
};
module.exports = { sendTelegramMessage };

