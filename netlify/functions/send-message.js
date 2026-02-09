// Netlify Function для отправки анонимных сообщений в Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

exports.handler = async function(event, context) {
  // Проверяем метод запроса
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        details: 'Only POST requests are accepted' 
      })
    };
  }
  
  // Проверяем, указаны ли токен и chat_id
  if (!TELEGRAM_BOT_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Bot token not configured',
        details: 'Please set TELEGRAM_BOT_TOKEN environment variable in Netlify' 
      })
    };
  }
  
  if (!TELEGRAM_CHAT_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Chat ID not configured',
        details: 'Please set TELEGRAM_CHAT_ID environment variable in Netlify' 
      })
    };
  }
  
  try {
    // Парсим тело запроса
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body' 
        })
      };
    }
    
    const { text, mood } = data;
    
    // Проверяем наличие обязательных полей
    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Message text is required' 
        })
      };
    }
    
    // Проверяем длину сообщения
    const trimmedText = text.trim();
    if (trimmedText.length < 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Message is too short',
          details: 'Message must be at least 10 characters long' 
        })
      };
    }
    
    if (trimmedText.length > 1000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Message is too long',
          details: 'Message must be no more than 1000 characters' 
        })
      };
    }
    
    // Защита от спама (дополнительная проверка)
    const userIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    const userAgent = event.headers['user-agent'] || 'unknown';
    
    // Создаем текст сообщения для Telegram
    const moodEmojis = {
      neutral: '😐',
      positive: '😊',
      question: '❓',
      feedback: '💬'
    };
    
    const emoji = moodEmojis[mood] || '📨';
    const timestamp = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const message = `
${emoji} *НОВОЕ АНОНИМНОЕ СООБЩЕНИЕ*

💬 *Текст:*
${trimmedText}

📊 *Настроение:* ${mood || 'не указано'}
⏰ *Время:* ${timestamp}
🌐 *IP:* ${userIP}
📱 *Браузер:* ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}

_Отправлено через личный сайт_
    `;
    
    // Отправляем сообщение в Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    
    const telegramData = await telegramResponse.json();
    
    if (!telegramData.ok) {
      console.error('Telegram API error:', telegramData);
      
      // Детализация ошибок от Telegram
      let errorDetails = telegramData.description || 'Unknown Telegram API error';
      
      // Пользовательские сообщения об ошибках
      if (errorDetails.includes('chat not found')) {
        errorDetails = 'Chat ID указан неверно. Проверьте TELEGRAM_CHAT_ID';
      } else if (errorDetails.includes('bot token') || errorDetails.includes('Not Found')) {
        errorDetails = 'Токен бота указан неверно. Проверьте TELEGRAM_BOT_TOKEN';
      } else if (errorDetails.includes('Too Many Requests')) {
        errorDetails = 'Слишком много запросов. Подождите немного';
      }
      
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Failed to send to Telegram',
          details: errorDetails
        })
      };
    }
    
    // Логируем успешную отправку (без конфиденциальных данных)
    console.log(`Message sent successfully to Telegram. Message ID: ${telegramData.result.message_id}`);
    
    // Возвращаем успешный ответ
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Сообщение успешно отправлено!',
        telegramMessageId: telegramData.result.message_id
      })
    };
    
  } catch (error) {
    console.error('Unexpected error in send-message function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        note: 'Check function logs for more information'
      })
    };
  }
};