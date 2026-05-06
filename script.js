(() => {
  const micBtn = document.getElementById("micBtn");
  const stopBtn = document.getElementById("stopBtn");
  const clearBtn = document.getElementById("clearBtn");
  const muteBtn = document.getElementById("muteBtn");
  const statusEl = document.getElementById("status");
  const statusDot = document.getElementById("statusDot");
  const conversationEl = document.getElementById("conversation");
  const emptyState = document.getElementById("emptyState");
  const visualizer = document.getElementById("visualizer");
  const langPills = document.querySelectorAll(".pill");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let currentLang = "ur-PK";
  let listening = false;
  let muted = false;
  let recognition = null;

  function setStatus(text, state = "ready") {
    statusEl.textContent = text;
    statusDot.className = "status-dot";
    if (state !== "ready") statusDot.classList.add(state);
  }

  function hideEmpty() {
    if (emptyState) emptyState.style.display = "none";
  }

  function addBubble(text, who) {
    hideEmpty();
    const row = document.createElement("div");
    row.className = `bubble-row ${who}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${who}`;
    avatar.textContent = who === "user" ? "آپ" : "B";

    const bubble = document.createElement("div");
    bubble.className = `bubble ${who}`;
    bubble.textContent = text;

    row.appendChild(avatar);
    row.appendChild(bubble);
    conversationEl.appendChild(row);
    conversationEl.scrollTop = conversationEl.scrollHeight;
    return bubble;
  }

  function addTyping() {
    hideEmpty();
    const row = document.createElement("div");
    row.className = "bubble-row bot";
    row.id = "typingRow";
    row.innerHTML = `
      <div class="avatar bot">B</div>
      <div class="bubble bot"><span class="typing"><span></span><span></span><span></span></span></div>
    `;
    conversationEl.appendChild(row);
    conversationEl.scrollTop = conversationEl.scrollHeight;
  }

  function removeTyping() {
    const row = document.getElementById("typingRow");
    if (row) row.remove();
  }

  if (!SpeechRecognition) {
    setStatus("براؤزر سپورٹ نہیں کرتا — Chrome استعمال کریں", "listening");
    micBtn.disabled = true;
    return;
  }

  function buildRecognition() {
    const r = new SpeechRecognition();
    r.lang = currentLang;
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onstart = () => {
      listening = true;
      micBtn.classList.add("listening");
      visualizer.classList.add("active");
      setStatus("سن رہا ہوں...", "listening");
    };

    r.onend = () => {
      listening = false;
      micBtn.classList.remove("listening");
      visualizer.classList.remove("active");
    };

    r.onerror = (event) => {
      listening = false;
      micBtn.classList.remove("listening");
      visualizer.classList.remove("active");
      if (event.error === "no-speech") setStatus("کچھ سنائی نہیں دیا، دوبارہ کوشش کریں");
      else if (event.error === "not-allowed") setStatus("مائیک کی اجازت دیں");
      else setStatus("خرابی: " + event.error);
    };

    r.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      addBubble(transcript, "user");
      setStatus("سوچ رہا ہوں...", "thinking");
      addTyping();

      await new Promise(res => setTimeout(res, 500));
      removeTyping();

      const reply = window.findUrduResponse(transcript);
      addBubble(reply, "bot");

      if (!muted) {
        setStatus("جواب پڑھ رہا ہوں...", "speaking");
        await speak(reply);
      }
      setStatus("تیار ہے");
    };

    return r;
  }

  recognition = buildRecognition();

  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === currentLang) ||
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith(currentLang.split("-")[0])) ||
      voices.find(v => v.lang === "hi-IN") ||
      voices[0]
    );
  }

  function speak(text) {
    return new Promise(resolve => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLang;
      utter.rate = 0.95; utter.pitch = 1;
      const v = pickVoice();
      if (v) utter.voice = v;
      utter.onend = resolve;
      utter.onerror = resolve;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    });
  }

  micBtn.addEventListener("click", () => {
    if (listening) { recognition.stop(); return; }
    try {
      speechSynthesis.cancel();
      recognition.start();
    } catch (e) {
      setStatus("مائیک شروع نہیں ہوا: " + e.message);
    }
  });

  stopBtn.addEventListener("click", () => {
    if (listening) try { recognition.stop(); } catch (_) {}
    speechSynthesis.cancel();
    setStatus("روک دیا گیا");
  });

  clearBtn.addEventListener("click", () => {
    conversationEl.innerHTML = "";
    if (emptyState) {
      conversationEl.appendChild(emptyState);
      emptyState.style.display = "";
    }
    setStatus("گفتگو صاف کر دی گئی");
  });

  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.classList.toggle("muted", muted);
    muteBtn.querySelector("span").textContent = muted ? "خاموش" : "آواز";
    if (muted) speechSynthesis.cancel();
  });

  langPills.forEach(pill => {
    pill.addEventListener("click", () => {
      langPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentLang = pill.dataset.lang;
      try { recognition.abort(); } catch (_) {}
      recognition = buildRecognition();
      setStatus("زبان تبدیل کر دی گئی: " + pill.textContent);
    });
  });

  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.onvoiceschanged = pickVoice;
  }
})();
