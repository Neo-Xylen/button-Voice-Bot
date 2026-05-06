(() => {
  const micBtn = document.getElementById("micBtn");
  const stopBtn = document.getElementById("stopBtn");
  const clearBtn = document.getElementById("clearBtn");
  const statusEl = document.getElementById("status");
  const conversationEl = document.getElementById("conversation");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    statusEl.textContent = "افسوس! آپ کا براؤزر Web Speech API سپورٹ نہیں کرتا۔ Chrome استعمال کریں۔";
    micBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ur-PK";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let listening = false;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function addBubble(text, who) {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${who}`;
    const label = document.createElement("span");
    label.className = "who";
    label.textContent = who === "user" ? "آپ" : "بوٹ";
    const body = document.createElement("span");
    body.textContent = text;
    bubble.appendChild(label);
    bubble.appendChild(body);
    conversationEl.appendChild(bubble);
    conversationEl.scrollTop = conversationEl.scrollHeight;
  }

  function pickUrduVoice() {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === "ur-PK") ||
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith("ur")) ||
      voices.find(v => v.lang === "hi-IN") ||
      voices[0]
    );
  }

  function speak(text) {
    return new Promise(resolve => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ur-PK";
      utter.rate = 0.95;
      utter.pitch = 1;
      const voice = pickUrduVoice();
      if (voice) utter.voice = voice;
      utter.onend = resolve;
      utter.onerror = resolve;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    });
  }

  function startListening() {
    if (listening) return;
    try {
      speechSynthesis.cancel();
      recognition.start();
    } catch (e) {
      setStatus("مائیک شروع کرنے میں مسئلہ: " + e.message);
    }
  }

  function stopAll() {
    if (listening) {
      try { recognition.stop(); } catch (_) {}
    }
    speechSynthesis.cancel();
    setStatus("روک دیا گیا۔");
  }

  recognition.onstart = () => {
    listening = true;
    micBtn.classList.add("listening");
    micBtn.querySelector(".mic-label").textContent = "سن رہا ہوں...";
    setStatus("سن رہا ہوں... بولیں۔");
  };

  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove("listening");
    micBtn.querySelector(".mic-label").textContent = "بات کریں";
  };

  recognition.onerror = (event) => {
    listening = false;
    micBtn.classList.remove("listening");
    micBtn.querySelector(".mic-label").textContent = "بات کریں";
    if (event.error === "no-speech") {
      setStatus("کچھ سنائی نہیں دیا۔ دوبارہ کوشش کریں۔");
    } else if (event.error === "not-allowed") {
      setStatus("مائیک کی اجازت دیں اور دوبارہ کوشش کریں۔");
    } else {
      setStatus("خرابی: " + event.error);
    }
  };

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    addBubble(transcript, "user");
    setStatus("جواب تیار کیا جا رہا ہے...");

    const reply = window.findUrduResponse(transcript);
    addBubble(reply, "bot");
    setStatus("جواب پڑھا جا رہا ہے...");

    await speak(reply);
    setStatus("تیار ہے۔ دوبارہ بٹن دبا کر بات کریں۔");
  };

  micBtn.addEventListener("click", startListening);
  stopBtn.addEventListener("click", stopAll);
  clearBtn.addEventListener("click", () => {
    conversationEl.innerHTML = "";
    setStatus("گفتگو صاف کر دی گئی۔");
  });

  // Preload voices (some browsers fire this asynchronously)
  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.onvoiceschanged = () => pickUrduVoice();
  }
})();
