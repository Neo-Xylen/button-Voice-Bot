// Urdu intent rules. Each rule has keyword patterns (Urdu + Roman Urdu + English)
// and a list of possible Urdu replies. The first matching rule wins.
const URDU_INTENTS = [
  {
    name: "greeting",
    patterns: [
      "السلام علیکم", "سلام", "ہیلو", "ہائے",
      "assalam", "salam", "hello", "hi", "hey"
    ],
    replies: [
      "وعلیکم السلام! میں آپ کی کیا مدد کر سکتا ہوں؟",
      "سلام! خوش آمدید۔ بتائیں کیا پوچھنا چاہتے ہیں؟",
      "ہیلو! میں اردو وائس بوٹ ہوں۔ آپ کیسے ہیں؟"
    ]
  },
  {
    name: "how_are_you",
    patterns: [
      "کیسے ہو", "کیسے ہیں", "کیا حال", "حال چال",
      "kaise ho", "kaisay ho", "kya haal", "how are you"
    ],
    replies: [
      "میں بالکل ٹھیک ہوں، شکریہ! آپ سنائیں۔",
      "الحمدللہ، میں خیریت سے ہوں۔ آپ کیسے ہیں؟"
    ]
  },
  {
    name: "name",
    patterns: [
      "تمہارا نام", "آپ کا نام", "نام کیا",
      "tumhara naam", "aap ka naam", "your name", "what is your name"
    ],
    replies: [
      "میرا نام اردو وائس بوٹ ہے۔",
      "مجھے آپ اردو بوٹ کہہ سکتے ہیں۔"
    ]
  },
  {
    name: "creator",
    patterns: [
      "تمہیں کس نے بنایا", "آپ کو کس نے بنایا", "تمہارا بنانے والا",
      "who made you", "who created you"
    ],
    replies: [
      "مجھے ایک ڈویلپر نے Web Speech API کی مدد سے بنایا ہے۔"
    ]
  },
  {
    name: "time",
    patterns: ["وقت کیا", "ٹائم کیا", "time", "kya waqt", "kitne baje"],
    replies: [() => `ابھی وقت ${new Date().toLocaleTimeString("ur-PK")} ہے۔`]
  },
  {
    name: "date",
    patterns: ["تاریخ کیا", "آج کون سا دن", "date", "aaj kya din"],
    replies: [() => `آج ${new Date().toLocaleDateString("ur-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} ہے۔`]
  },
  {
    name: "weather",
    patterns: ["موسم", "بارش", "گرمی", "سردی", "weather", "mausam"],
    replies: [
      "معذرت، میں ابھی موسم کی معلومات نہیں دے سکتا، لیکن باہر دیکھنا اچھا خیال ہے!",
      "موسم کی تازہ معلومات کے لیے براہ کرم کوئی موسمی ایپ دیکھیں۔"
    ]
  },
  {
    name: "thanks",
    patterns: ["شکریہ", "مہربانی", "thanks", "thank you", "shukriya"],
    replies: [
      "آپ کا بہت بہت شکریہ!",
      "خوشی ہوئی مدد کر کے۔",
      "کوئی بات نہیں، یہ میرا فرض ہے۔"
    ]
  },
  {
    name: "joke",
    patterns: ["لطیفہ", "مذاق", "joke", "lateefa"],
    replies: [
      "ایک طالب علم نے استاد سے پوچھا: سر، کیا میں کسی ایسی چیز کے لیے سزا پاؤں جو میں نے کی نہیں؟ استاد: نہیں! طالب علم: بہت خوب، میں نے ہوم ورک نہیں کیا۔",
      "ڈاکٹر: آپ کو کیا مسئلہ ہے؟ مریض: مجھے بھولنے کی بیماری ہے۔ ڈاکٹر: کب سے؟ مریض: کب سے کیا؟"
    ]
  },
  {
    name: "help",
    patterns: ["مدد", "کیا کر سکتے", "help", "madad", "what can you do"],
    replies: [
      "میں سلام، وقت، تاریخ، لطیفے، اور سادہ سوالات کے جوابات دے سکتا ہوں۔ بس بٹن دبا کر بات کریں۔"
    ]
  },
  {
    name: "bye",
    patterns: ["خدا حافظ", "اللہ حافظ", "الوداع", "bye", "goodbye", "khuda hafiz"],
    replies: [
      "اللہ حافظ! ملتے ہیں دوبارہ۔",
      "خدا حافظ، آپ کا دن اچھا گزرے!"
    ]
  },
  {
    name: "yes",
    patterns: ["جی ہاں", "ہاں", "بالکل", "yes", "haan", "ji"],
    replies: ["ٹھیک ہے، آگے بتائیں۔", "بہت اچھا!"]
  },
  {
    name: "no",
    patterns: ["نہیں", "no", "nahin", "nahi"],
    replies: ["کوئی بات نہیں۔", "ٹھیک ہے، اور کچھ پوچھیں۔"]
  }
];

const FALLBACKS = [
  "معذرت، میں آپ کا سوال سمجھ نہیں سکا۔ دوبارہ کوشش کریں۔",
  "میں ابھی سیکھ رہا ہوں۔ کیا آپ مختلف انداز میں پوچھ سکتے ہیں؟",
  "یہ سوال میرے لیے نیا ہے، مگر میں بہتر ہونے کی کوشش کر رہا ہوں۔"
];

function pickReply(replies) {
  const choice = replies[Math.floor(Math.random() * replies.length)];
  return typeof choice === "function" ? choice() : choice;
}

function findUrduResponse(text) {
  const lower = (text || "").toLowerCase().trim();
  if (!lower) return pickReply(FALLBACKS);

  for (const intent of URDU_INTENTS) {
    if (intent.patterns.some(p => lower.includes(p.toLowerCase()))) {
      return pickReply(intent.replies);
    }
  }
  return pickReply(FALLBACKS);
}

window.findUrduResponse = findUrduResponse;
