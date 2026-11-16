(function() {
  const config = window.GBSLiveAssistantConfig || {
    backendUrl: 'https://maja-gbs-cidp.onrender.com',
    avatarUrl: 'assets/assistant-maya.png',
    autoOpen: false
  };

  const state = {
    isOpen: false,
    isListening: false,
    history: []
  };

  // Create UI
  const root = document.createElement('div');
  root.id = 'gbs-live-assistant-root';
  document.body.appendChild(root);

  const style = document.createElement('style');
  style.textContent = `
    #gbs-live-assistant-root { position: fixed; bottom: 20px; right: 20px; z-index: 100000 !important; font-family: 'DM Sans', sans-serif; }
    .gbs-ai-launcher { width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; transition: transform 0.3s ease; }
    .gbs-ai-launcher:hover { transform: scale(1.1); }
    .gbs-ai-launcher img { width: 100%; height: 100%; object-fit: cover; }
    .gbs-ai-panel { position: fixed; bottom: 90px; right: 20px; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); display: none; flex-direction: column; overflow: hidden; border: 1px solid #eee; }
    .gbs-ai-panel.active { display: flex; }
    .gbs-ai-header { background: #0c4a38; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
    .gbs-ai-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .gbs-ai-messages { flex: 1; overflow-y: auto; padding: 15px; background: #fafafa; display: flex; flex-direction: column; }
    .gbs-ai-message { margin-bottom: 10px; padding: 10px; border-radius: 8px; max-width: 85%; font-size: 14px; line-height: 1.4; }
    .gbs-ai-message.user { background: #e4f3ec; align-self: flex-end; margin-left: auto; border-bottom-right-radius: 2px; }
    .gbs-ai-message.assistant { background: white; border: 1px solid #eee; align-self: flex-start; border-bottom-left-radius: 2px; }
    .gbs-ai-composer { padding: 10px; border-top: 1px solid #eee; display: flex; gap: 5px; align-items: center; }
    .gbs-ai-input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 8px 15px; outline: none; }
    .gbs-ai-mic { background: none; border: none; font-size: 20px; cursor: pointer; color: #666; padding: 5px; display: flex; align-items: center; }
    .gbs-ai-mic.active { color: #b82a1e; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    .gbs-ai-send { background: #0c4a38; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .gbs-ai-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
    .gbs-ai-header-actions { display: flex; align-items: center; gap: 8px; }
    .gbs-ai-stop { background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.5); color: white; border-radius: 14px; padding: 4px 10px; font-size: 12px; cursor: pointer; font-family: inherit; }
    .gbs-ai-stop[hidden] { display: none; }
    .gbs-ai-message.pending { color: #777; font-style: italic; }
  `;
  document.head.appendChild(style);

  root.innerHTML = `
    <button class="gbs-ai-launcher" aria-label="Odpri asistentko">
      <img src="${config.avatarUrl}" alt="Maja">
    </button>
    <div class="gbs-ai-panel">
      <header class="gbs-ai-header">
        <strong>Maja - AI pomoč</strong>
        <span class="gbs-ai-header-actions">
          <button class="gbs-ai-stop" hidden aria-label="Ustavi govor">Ustavi govor</button>
          <button class="gbs-ai-close" aria-label="Zapri pogovor">&times;</button>
        </span>
      </header>
      <div class="gbs-ai-body">
        <div class="gbs-ai-messages"></div>
        <div class="gbs-ai-composer">
          <button class="gbs-ai-mic" title="Glasovno spraševanje">🎤</button>
          <input type="text" class="gbs-ai-input" placeholder="Vprašajte Majo...">
          <button class="gbs-ai-send">➤</button>
        </div>
      </div>
    </div>
  `;

  const launcher = root.querySelector('.gbs-ai-launcher');
  const panel = root.querySelector('.gbs-ai-panel');
  const closeBtn = root.querySelector('.gbs-ai-close');
  const messages = root.querySelector('.gbs-ai-messages');
  const input = root.querySelector('.gbs-ai-input');
  const sendBtn = root.querySelector('.gbs-ai-send');
  const micBtn = root.querySelector('.gbs-ai-mic');
  const stopBtn = root.querySelector('.gbs-ai-stop');

  // Govorjeni odgovor: en sam predvajalnik, ki ga "odklene" klik na mikrofon (zahteva telefonov)
  const player = new Audio();
  const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  function stopSpeech() {
    player.pause();
    stopBtn.hidden = true;
  }
  player.addEventListener('ended', () => { stopBtn.hidden = true; });
  player.addEventListener('error', () => { stopBtn.hidden = true; });

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'sl-SI';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      input.value = text;
      sendMessage(true);
    };

    recognition.onend = () => {
      state.isListening = false;
      micBtn.classList.remove('active');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      micBtn.classList.remove('active');
    };
  } else {
    micBtn.style.display = 'none';
  }

  function toggleMic() {
    if (!recognition) return;
    if (state.isListening) {
      recognition.stop();
    } else {
      stopSpeech();
      player.src = SILENCE;
      player.play().catch(() => {});
      recognition.start();
      state.isListening = true;
      micBtn.classList.add('active');
    }
  }

  function openAssistant(prompt = '') {
    panel.classList.add('active');
    state.isOpen = true;
    if (messages.children.length === 0) {
      addMessage('assistant', 'Pozdravljeni! Sem Maja. Kako vam lahko pomagam?');
    }
    if (prompt) {
      input.value = prompt;
      sendMessage();
    }
  }

  function closeAssistant() {
    stopSpeech();
    panel.classList.remove('active');
    state.isOpen = false;
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `gbs-ai-message ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // viaVoice = vprašanje je bilo izgovorjeno v mikrofon -> Maja odgovori tudi z glasom
  async function sendMessage(viaVoice = false) {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    stopSpeech();
    addMessage('user', text);
    const pending = addMessage('assistant', viaVoice ? 'Maja pripravlja govorjeni odgovor …' : 'Maja piše …');
    pending.classList.add('pending');

    try {
      const res = await fetch(`${config.backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: state.history.slice(-12), voice: viaVoice === true })
      });
      const data = await res.json();
      const reply = data.reply || 'Oprostite, prišlo je do napake.';
      pending.classList.remove('pending');
      pending.textContent = reply;
      messages.scrollTop = messages.scrollHeight;
      if (data.reply) {
        state.history.push({ role: 'user', content: text }, { role: 'assistant', content: data.reply });
      }
      if (viaVoice === true && data.audioBase64) {
        player.src = `data:${data.audioMimeType || 'audio/mpeg'};base64,${data.audioBase64}`;
        player.play().then(() => { stopBtn.hidden = false; }).catch(() => {});
      }
    } catch (e) {
      pending.classList.remove('pending');
      pending.textContent = 'Trenutno nisem dosegljiva. Prosim, poskusite kasneje.';
    }
  }

  launcher.addEventListener('click', () => openAssistant());
  closeBtn.addEventListener('click', () => closeAssistant());
  sendBtn.addEventListener('click', () => sendMessage());
  stopBtn.addEventListener('click', () => stopSpeech());
  micBtn.addEventListener('click', () => toggleMic());
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-assistant]') || 
                (e.target.tagName === 'A' && e.target.innerText.includes('Pogovor z Majo')) ||
                (e.target.tagName === 'BUTTON' && e.target.innerText.includes('Odpri asistentko'));
    
    if (btn) {
      e.preventDefault();
      openAssistant();
    }
  });

  if (config.autoOpen) setTimeout(openAssistant, 1000);
})();
