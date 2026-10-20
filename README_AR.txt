سيرفر أكواد تفعيل ABN SENARA LOADER

الملفات:
- server.js: كود السيرفر وواجهات API.
- package.json: إعدادات تشغيل Node.js.
- data/codes.json: قاعدة أكواد تجريبية (فارغة حالياً).
- .gitignore: يمنع رفع ملفات مؤقتة وأسرار.

النشر على Render:
1. ارفع محتويات هذا المجلد إلى مستودع GitHub.
2. في Render أنشئ Web Service واربطه بالمستودع.
3. Build Command: npm install
4. Start Command: npm start
5. أضف متغير بيئة باسم ADMIN_TOKEN وضع قيمة سرية طويلة لا تشاركها.
6. انشر الخدمة واختبر /health.

التحقق:
POST /api/validate
JSON: {"code":"SENARA-ABC123","deviceId":"optional-device-id"}

إضافة كود:
POST /admin/codes
Header: x-admin-token: قيمة ADMIN_TOKEN
JSON: {"code":"SENARA-ABC123","expiresAt":null,"enabled":true}

تنبيه:
هذا قالب أولي، ولا يربط تطبيق APK تلقائياً. يجب تعديل التطبيق ليرسل الكود إلى عنوان السيرفر ويقرأ النتيجة. تخزين JSON محلي قد لا يكون دائماً على الاستضافة؛ للاستخدام الحقيقي أضف قاعدة بيانات أو قرصاً دائماً.
