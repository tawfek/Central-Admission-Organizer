export interface IraqLocation {
  id: string
  translationKey: string
  aliases: string[]
  englishAliases: string[]
}

// Presets cover all Iraqi governorates / governorate capitals. The custom
// matcher can additionally prioritize any city or district as written in the
// Arabic source data. Common English names resolve to their Arabic aliases.
export const IRAQ_LOCATIONS: IraqLocation[] = [
  { id: "baghdad", translationKey: "locations.baghdad", aliases: ["بغداد"], englishAliases: ["baghdad"] },
  { id: "basra", translationKey: "locations.basra", aliases: ["البصرة", "بصره", "البصره"], englishAliases: ["basra", "basrah"] },
  { id: "nineveh", translationKey: "locations.nineveh", aliases: ["نينوى", "الموصل", "موصل"], englishAliases: ["nineveh", "ninawa", "mosul"] },
  { id: "erbil", translationKey: "locations.erbil", aliases: ["أربيل", "اربيل", "هولير"], englishAliases: ["erbil", "arbil", "hawler"] },
  { id: "sulaymaniyah", translationKey: "locations.sulaymaniyah", aliases: ["السليمانية", "سليمانية", "السليمانيه"], englishAliases: ["sulaymaniyah", "sulaimaniyah", "suleimaniyah", "slemani"] },
  { id: "duhok", translationKey: "locations.duhok", aliases: ["دهوك", "دهۆك"], englishAliases: ["duhok", "dohuk"] },
  { id: "kirkuk", translationKey: "locations.kirkuk", aliases: ["كركوك"], englishAliases: ["kirkuk"] },
  { id: "anbar", translationKey: "locations.anbar", aliases: ["الأنبار", "الانبار", "االنبار", "الرمادي", "رمادي", "الفلوجة", "فلوجة", "الفلوجه", "هيت", "حديثة", "حديثه"], englishAliases: ["anbar", "ramadi", "fallujah", "falluja", "hit", "haditha"] },
  { id: "salah-al-din", translationKey: "locations.salahAlDin", aliases: ["صلاح الدين", "تكريت", "سامراء", "سامرا", "بيجي", "بلد"], englishAliases: ["salah al-din", "salahaddin", "tikrit", "samarra", "baiji", "balad"] },
  { id: "diyala", translationKey: "locations.diyala", aliases: ["ديالى", "دياله", "بعقوبة", "بعقوبه", "الخالص", "المقدادية", "المقداديه"], englishAliases: ["diyala", "baqubah", "baquba", "khalis", "muqdadiyah"] },
  { id: "babylon", translationKey: "locations.babylon", aliases: ["بابل", "الحلة", "الحله", "المسيب", "المحاويل"], englishAliases: ["babylon", "babil", "hillah", "hilla", "musayyib", "mahawil"] },
  { id: "karbala", translationKey: "locations.karbala", aliases: ["كربلاء", "كربالء", "كربلا"], englishAliases: ["karbala", "kerbala"] },
  { id: "najaf", translationKey: "locations.najaf", aliases: ["النجف", "نجف", "الكوفة", "كوفة", "الكوفه"], englishAliases: ["najaf", "kufa", "kufa"] },
  { id: "qadisiyah", translationKey: "locations.qadisiyah", aliases: ["القادسية", "القادسيه", "الديوانية", "الديوانيه", "الشامية", "الشاميه"], englishAliases: ["qadisiyah", "qadisiya", "diwaniyah", "diwaniya", "shamiya"] },
  { id: "wasit", translationKey: "locations.wasit", aliases: ["واسط", "الكوت", "كوت", "النعمانية", "النعمانيه", "الصويرة", "الصويره"], englishAliases: ["wasit", "kut", "numaniyah", "suwayrah"] },
  { id: "maysan", translationKey: "locations.maysan", aliases: ["ميسان", "العمارة", "العماره", "المجر الكبير"], englishAliases: ["maysan", "missan", "amarah", "amara", "majar al-kabir"] },
  { id: "dhi-qar", translationKey: "locations.dhiQar", aliases: ["ذي قار", "الناصرية", "الناصريه", "الشطرة", "الشطره", "سوق الشيوخ"], englishAliases: ["dhi qar", "thi qar", "nasiriyah", "nasiriya", "shatra", "suq al-shuyukh"] },
  { id: "muthanna", translationKey: "locations.muthanna", aliases: ["المثنى", "السماوة", "السماوه", "الرميثة", "الرميثه"], englishAliases: ["muthanna", "samawah", "samawa", "rumaitha"] },
  { id: "halabja", translationKey: "locations.halabja", aliases: ["حلبجة", "حلبجه"], englishAliases: ["halabja"] }
]

export function findIraqLocation(id: string) {
  return IRAQ_LOCATIONS.find((location) => location.id === id)
}

export function findIraqLocationByEnglishAlias(term: string) {
  const normalized = term.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
  if (!normalized) return undefined
  return IRAQ_LOCATIONS.find((location) => location.englishAliases.some((alias) => alias === normalized))
}
