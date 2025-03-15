// استيراد المكتبات المطلوبة
require('dotenv').config(); // تحميل متغيرات البيئة من .env
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000; // استخدم المنفذ من متغيرات البيئة أو 3000 افتراضيًا

// Middleware لتحليل JSON
app.use(express.json());

// متغيرات البيئة (استبدل هذه القيم في ملف .env)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// التحقق من Webhook
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully.');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// استقبال الرسائل والرد عليها
app.post('/webhook', async (req, res) => {
    try {
        console.log("Received request:", JSON.stringify(req.body, null, 2));

        // استخراج البيانات من الطلب
        const entry = req.body.entry?.[0];
        const change = entry?.changes?.[0]?.value;
        const messageObj = change?.messages?.[0];

        if (!messageObj) {
            console.log("No message found in the request.");
            return res.sendStatus(400);
        }

        const senderId = messageObj.from; // رقم المرسل
        const messageText = messageObj.text?.body || "رسالة غير معروفة"; // محتوى الرسالة

        console.log(`📩 رسالة من ${senderId}: ${messageText}`);

        // رد تلقائي بسيط
        const responseText = "شكرًا على رسالتك! كيف يمكنني مساعدتك؟ 😊";

        // إرسال الرد عبر API واتساب
        await sendWhatsAppMessage(senderId, responseText);

        res.sendStatus(200);
    } catch (error) {
        console.error("❌ خطأ أثناء معالجة الرسالة:", error.message);
        res.sendStatus(500);
    }
});

// دالة لإرسال الرسائل عبر واتساب API
async function sendWhatsAppMessage(to, message) {
    try {
        const url = `https://graph.facebook.com/v13.0/${PHONE_NUMBER_ID}/messages`;

        const response = await axios.post(
            url,
            {
                messaging_product: "whatsapp",
                to,
                text: { body: message },
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ تم إرسال الرد بنجاح:", response.data);
    } catch (error) {
        console.error("❌ خطأ أثناء إرسال الرسالة:", error.response?.data || error.message);
    }
}

// تصدير التطبيق عند التشغيل على Vercel
module.exports = app;

// تشغيل الخادم محليًا
if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 الخادم يعمل على http://localhost:${port}`);
    });
}
