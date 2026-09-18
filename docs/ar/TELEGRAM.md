# تطبيق Telegram Mini App

## إعداد BotFather

اجعل هذا المشروع **Main Mini App** للبوت واستخدم رابط HTTPS المنشور:

```text
https://tawfek.github.io/Central-Admission-Organizer/
```

إعدادات Telegram الحالية:

```text
Bot username: LuckySix7_Bot
Mini App short name: admission
Direct Mini App link: https://t.me/LuckySix7_Bot/admission
Web App URL: https://tawfek.github.io/Central-Admission-Organizer/
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

## معمارية بدون Backend

تطبيق Telegram Mini App يعمل عمدًا بدون Backend خاص بالتطبيق. GitHub Pages يستضيف التطبيق كاملًا، بينما توفر Telegram Mini App APIs وظائف المظهر والأزرار الأصلية وHaptic Feedback وCloudStorage مباشرة من جهة العميل.

بيانات مستخدم Telegram المتاحة داخل Mini App تستخدم فقط لتحسين العرض مثل اختيار اللغة الأولي وإظهار الاسم الأول، ولا تعتبر حسابًا موثقًا داخل النظام.

لا يحتاج هذا الـ Frontend إلى Bot Token ولا يجب حفظه داخل المستودع.

## روابط الاختيارات المشتركة

تبقى روابط الاختيارات روابط HTTPS عادية تحتوي IDs بالترتيب:

```text
https://tawfek.github.io/Central-Admission-Organizer/#/selection?choices=...
```

وبذلك تعمل داخل Telegram وWhatsApp والمتصفح وأي تطبيق آخر. فتح رابط مشترك لا يستبدل المسودة المحفوظة لدى الزائر، ويمكن تعديل القائمة المشتركة وترتيبها وطباعتها ونسخ رابط جديد منها.
