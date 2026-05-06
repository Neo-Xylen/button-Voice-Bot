# اردو وائس بوٹ — Urdu Voice Bot

A button-driven, browser-based voice bot that listens to spoken Urdu (and Roman Urdu / English keywords), generates a contextual Urdu reply, and speaks it back — all using the browser's built-in **Web Speech API**. No API keys, no backend, no install steps.

''''''''''''''## Features

- 🎤 Press-to-talk microphone button
- 🗣️ Recognises Urdu (`ur-PK`) speech
- 💬 Replies in Urdu using rule-based intent matching (greetings, time, date, jokes, thanks, etc.)
- 🔊 Speaks responses out loud via Speech Synthesis
- 🎨 RTL Urdu UI with conversation history
- ⛔ Stop / Clear controls

## Run it

Just open `index.html` in **Google Chrome** (recommended for best Urdu support):

```bash
# Option 1: open directly
xdg-open index.html        # Linux
open index.html            # macOS
start index.html           # Windows

# Option 2: serve locally (any static server works)
python3 -m http.server 8000
# then visit http://localhost:8000
```

Allow microphone access when prompted.

## How it works

| File           | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `index.html`   | RTL Urdu UI with mic / stop / clear buttons and conversation pane    |
| `style.css`    | Styling (gradient background, pulse animation, chat bubbles)         |
| `responses.js` | Intent rules (Urdu + Roman Urdu + English keywords) and reply lists  |
| `script.js`    | Hooks `SpeechRecognition` → intent match → `SpeechSynthesisUtterance`|

## Adding new responses

Edit `responses.js` and add a new entry to `URDU_INTENTS`:

```js
{
  name: "food",
  patterns: ["کھانا", "khana", "food"],
  replies: ["مجھے بریانی پسند ہے!", "کھانے میں کیا کھانا چاہیں گے؟"]
}
```

Replies can be plain strings or functions (for dynamic answers like time/date).

## Browser support

Web Speech API works best in **Chrome** and Chromium-based browsers (Edge, Brave). Firefox and Safari have limited or no Urdu speech recognition support.
