# تطبيق Telegram Mini App

## إعداد BotFather

اجعل هذا المشروع **Main Mini App** للبوت واستخدم رابط HTTPS المنشور:

```text
https://tawfek.github.io/Central-Admission-Organizer/
```

لا توجد نسخة Frontend منفصلة لتليغرام. نفس تطبيق React يكتشف تشغيله داخل Telegram ويفعل التكامل تلقائيًا.

## التكامل المنفذ

عند فتح التطبيق داخل Telegram فإنه:

- يستدعي `Telegram.WebApp.ready()` و `expand()`؛
- يتبع Light/Dark الخاص بتليغرام عندما يكون مظهر التطبيق على System؛
- يحترم Telegram viewport و safe-area؛
- يستخدم BackButton الأصلي لتليغرام في شاشة ترتيب الاختيارات؛
- يستخدم MainButton الأصلي لتليغرام كزر "التالي" في شاشة اختيار الأقسام؛
- يستخدم Haptic Feedback للاختيار والترتيب الناجح والتحذيرات والأخطاء والطباعة والتنقل؛
- يستخدم لغة مستخدم Telegram كاختيار أولي للعربية/الإنجليزية إذا لم يختر المستخدم لغة من قبل؛
- ويبقي تجربة المتصفح العادية كما هي.

## حفظ الاختيارات

في المتصفح يتم دائمًا حفظ حالة الاختيارات المرتبة داخل `localStorage`.

داخل Telegram، إذا كان العميل يدعم Bot API 6.9 أو أحدث، تتم مزامنة نفس الحالة المختصرة المبنية على IDs مع `Telegram.WebApp.CloudStorage`. وبذلك يوجد Backup عبر أجهزة المستخدم داخل نفس البوت، مع بقاء `localStorage` كـ fallback.

لا تُحفظ بيانات الجامعات نفسها في Telegram CloudStorage؛ يتم حفظ IDs وترتيبها فقط.

## الحسابات الموثوقة والإشعارات

الواجهة لا تعتبر `initDataUnsafe` مصدرًا موثوقًا لتسجيل الدخول. يمكن استخدام معلومات اللغة والاسم منه للعرض فقط.

لإضافة حسابات Telegram موثوقة أو إرسال إشعارات من البوت، انشر Backend واضبط:

```env
VITE_TELEGRAM_API_URL=https://api.example.com
```

بعدها ترسل الواجهة قيمة `initData` الأصلية إلى:

```http
POST /telegram/session
Content-Type: application/json

{
  "initData": "..."
}
```

يجب على السيرفر التحقق من Telegram signature و `auth_date` قبل إنشاء Session. يجب أن يبقى Bot Token في السيرفر فقط ولا يوضع أبدًا في متغير `VITE_*` أو داخل المستودع.

الاستجابة المتوقعة:

```json
{
  "user": {
    "id": "123456789",
    "firstName": "Tawfeeq",
    "username": "example",
    "languageCode": "ar"
  },
  "notificationsEnabled": false
}
```

واجهة Telegram الحالية توفر أيضًا `requestWriteAccess()` لاستخدامها لاحقًا عند إضافة واجهة اشتراك بالإشعارات. إرسال رسائل البوت فعليًا يحتاج Backend آمن وBot API.

## روابط الاختيارات المشتركة

تبقى روابط الاختيارات روابط HTTPS عادية تحتوي IDs بالترتيب:

```text
https://tawfek.github.io/Central-Admission-Organizer/#/selection?choices=...
```

وبذلك تعمل داخل Telegram وWhatsApp والمتصفح وأي تطبيق آخر. فتح رابط مشترك لا يستبدل المسودة المحفوظة لدى الزائر، ويمكن تعديل القائمة المشتركة وترتيبها وطباعتها ونسخ رابط جديد منها.
