// استيراد المكتبات المطلوبة
const express = require('express'); // لإنشاء الخادم
const axios = require('axios'); // لإرسال طلبات HTTP
const app = express();
const port = 3000; // المنفذ الذي يعمل عليه الخادم

// Middleware لتحليل JSON
app.use(express.json());

// روت للتحقق من Webhook
app.get('/webhook', (req, res) => {
  const verifyToken = 'mysecret123'; // يجب أن يتطابق مع الـ Verify Token الذي أدخلته في واتساب API
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // التحقق من صحة الـ Verify Token
  if (mode && token === verifyToken) {
    res.status(200).send(challenge); // إرسال الـ challenge للتحقق
  } else {
    res.sendStatus(403); // رفض الطلب إذا كان الـ Verify Token غير صحيح
  }
});

app.post('/webhook', (req, res) => {
    console.log("تم استقبال طلب:", JSON.stringify(req.body, null, 2)); // طباعة البيانات الواردة
  
    try {
      // استخراج الرسالة الواردة من واتساب
      const message = req.body.entry[0].changes[0].value.messages[0].text.body;
      console.log("رسالة واردة:", message);
  
      // هنا يمكنك إضافة الكود للرد على الرسالة
      const response = "شكرًا على رسالتك!"; // رد تلقائي بسيط
  
      // إرسال الرد إلى واتساب
      const phoneNumberId = '624989047360616'; // استبدلها بـ Phone Number ID الخاص بك
      const accessToken = 'EAAJXDvcVlaQBO9ZBxuc7Ayp4iI4LPcZAERT2RiT62Mn0JYEtJzsuZCcG6veEQEXNGbquB9ljjdd2L3gSsSu6hbQcrPFN9tBWgx8YsZChdY0GZBKIS2KccVgQk0CC2zrumKtlOBbLCgZBl1E0CQ1HNrZCrm7kq0wJBpKqIOO9q0FAydGur1IT2NKiNKk'; // استبدلها بـ Access Token الخاص بك
  
      axios.post(`https://graph.facebook.com/v13.0/${phoneNumberId}/messages`, {
        messaging_product: "whatsapp", // نوع الخدمة
        to: req.body.entry[0].changes[0].value.messages[0].from, // رقم المرسل
        text: { body: response } // نص الرد
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}` // مفتاح الوصول
        }
      });
  
      // إرسال استجابة نجاح إلى واتساب
      res.sendStatus(200);
    } catch (error) {
      console.error("حدث خطأ:", error); // طباعة الخطأ إذا حدث
      res.sendStatus(500); // إرسال استجابة خطأ إلى واتساب
    }
  });

// تشغيل الخادم
app.listen(port, () => {
  console.log(`الخادم يعمل على http://localhost:${port}`);
});