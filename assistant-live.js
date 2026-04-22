(function () {
  const config = Object.assign({
    apiUrl: 'https://maja-gbs-cidp.onrender.com/api/chat',
    assistantName: 'Maja',
    siteName: 'Društvo GBS in CIDP Slovenije',
    assistantRole: 'Virtualna svetovalka',
    avatarUrl: 'https://mlakarmatjaz-art.github.io/Drustvo-GBS-in-CIDP-Slovenije/assets/assistant-maya.png',
    autoOpen: false,
    speakReplies: false,
    suggestions: [
      'Kaj je GBS?',
      'Kaj je CIDP?',
      'Kako postanem član?',
      'Katere dokumente ponuja društvo?',
      'Potrebujem prijazen pogovor.'
    ],
    greeting: 'Pozdravljeni. Sem Maja, virtualna asistentka društva. Z veseljem pomagam pri vprašanjih o GBS, CIDP, članstvu, dokumentih, podpori in osnovnih vsakdanjih vprašanjih.'
  }, window.GBSLiveAssistantConfig || {});

  const state = {
    history: [],
    currentAudio: null,
    recognizer: null,
    isListening: false,
    synth: window.speechSynthesis || null
  };

  const root = document.createElement('div');
  root.id = 'gbs-live-assistant-root';
  root.innerHTML = `
    <button class="gbs-ai-launcher gbs-ai-breathing" aria-label="Odpri AI asistentko">
      <span class="gbs-ai-pulse"></span>
      <img src="${config.avatarUrl}" alt="${config.assistantName}">
    </button>
    <section class="gbs-ai-panel gbs-ai-hidden gbs-ai-breathing" aria-live="polite">
      <header class="gbs-ai-header">
        <div class="gbs-ai-topline">
          <div>
            <div style="font-size:13px;opacity:.88">AI pomoč v živo</div>
            <strong>${config.siteName}</strong>
          </div>
          <button class="gbs-ai-close" aria-label="Zapri">×</button>
        </div>
        <div class="gbs-ai-hero">
          <div class="gbs-ai-avatar-wrap">
            <div class="gbs-ai-avatar-ring"></div>
            <img class="gbs-ai-avatar" src="${config.avatarUrl}" alt="${config.assistantName}">
          </div>
          <div>
            <h2 class="gbs-ai-title">${config.assistantName}</h2>
            <p class="gbs-ai-subtitle">${config.assistantRole}. Topla, vljudna in empatična pomoč za vprašanja o društvu, GBS, CIDP in vsakdanjih zadevah.</p>
          </div>
        </div>
        <div class="gbs-ai-statusbar">
          <span class="gbs-ai-badge" data-status>Pripravljena za pogovor</span>
          <span class="gbs-ai-eq" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        </div>
      </header>
      <div class="gbs-ai-body">
        <div class="gbs-ai-suggestions"></div>
        <div class="gbs-ai-messages"></div>
        <div class="gbs-ai-composer">
          <div class="gbs-ai-inputrow">
            <button class="gbs-ai-mic" type="button" aria-label="Govori">🎙️</button>
            <textarea class="gbs-ai-input" rows="1" placeholder="Napišite vprašanje ali uporabite mikrofon..."></textarea>
            <button class="gbs-ai-send" type="button" aria-label="Pošlji">➤</button>
          </div>
          <div class="gbs-ai-note">Informativna pomoč. Ob nujnih simptomih takoj pokličite 112 ali se obrnite na zdravnika.</div>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(root);

  const launcher = root.querySelector('.gbs-ai-launcher');
  const panel = root.querySelector('.gbs-ai-panel');
  const closeBtn = root.querySelector('.gbs-ai-close');
  const messages = root.querySelector('.gbs-ai-messages');
  const input = root.querySelector('.gbs-ai-input');
  const sendBtn = root.querySelector('.gbs-ai-send');
  const micBtn = root.querySelector('.gbs-ai-mic');
  const suggestionsWrap = root.querySelector('.gbs-ai-suggestions');
  const statusEl = root.querySelector('[data-status]');

  function setStatus(text, mode) {
    statusEl.textContent = text;
    panel.classList.remove('gbs-ai-speaking', 'gbs-ai-listening');
    if (mode) panel.classList.add(mode);
  }

  function addMessage(role, text, opts = {}) {
    const bubble = document.createElement('div');
    bubble.className = `gbs-ai-msg ${role}`;
    if (opts.typing) {
      bubble.innerHTML = '<span class="gbs-ai-typing"><span></span><span></span><span></span></span>';
    } else {
      bubble.textContent = text;
    }
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function openAssistant(prefill) {
    panel.classList.remove('gbs-ai-hidden');
    launcher.classList.add('gbs-ai-hidden');
    if (messages.children.length === 0) {
      addMessage('assistant', config.greeting);
    }
    if (prefill) {
      input.value = prefill;
    }
    setTimeout(() => input.focus(), 40);
  }

  function closeAssistant() {
    panel.classList.add('gbs-ai-hidden');
    launcher.classList.remove('gbs-ai-hidden');
    setStatus('Pripravljena za pogovor');
    stopSpeech();
  }

  function pickVoice() {
    if (!state.synth) return null;
    const voices = state.synth.getVoices() || [];
    const preferred = [
      /sl(-|_)si/i,
      /croatian|hr(-|_)hr/i,
      /serbian|sr(-|_)rs/i,
      /sloven/i,
      /female/i,
      /zira|aria|eva|emma|samantha|helena/i
    ];
    for (const pattern of preferred) {
      const v = voices.find(voice => pattern.test(`${voice.lang} ${voice.name}`));
      if (v) return v;
    }
    return voices[0] || null;
  }

  function stopSpeech() {
    if (state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio = null;
    }
    if (state.synth && state.synth.speaking) {
      state.synth.cancel();
    }
  }

  function speakText(text) {
    if (!config.speakReplies || !state.synth || !text) return;
    stopSpeech();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'sl-SI';
    utter.rate = 0.97;
    utter.pitch = 1.03;
    utter.volume = 1;
    const voice = pickVoice();
    if (voice) utter.voice = voice;
    utter.onstart = () => setStatus(`${config.assistantName} govori`, 'gbs-ai-speaking');
    utter.onend = () => setStatus('Pripravljena za pogovor');
    utter.onerror = () => setStatus('Odgovor pripravljen');
    state.synth.speak(utter);
  }

  function playAudio(base64, mimeType) {
    if (!base64) return false;
    try {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      stopSpeech();
      state.currentAudio = new Audio(url);
      state.currentAudio.addEventListener('play', () => setStatus(`${config.assistantName} govori`, 'gbs-ai-speaking'));
      state.currentAudio.addEventListener('ended', () => setStatus('Pripravljena za pogovor'));
      state.currentAudio.addEventListener('error', () => setStatus('Odgovor pripravljen'));
      state.currentAudio.play().catch(() => speakText('Odgovor je pripravljen.'));
      return true;
    } catch (err) {
      return false;
    }
  }

  function fallbackReply(raw) {
    const text = (raw || '').toLowerCase();
    const has = (...parts) => parts.some(p => text.includes(p));

    if (has('živjo', 'pozdrav', 'dober dan', 'dobro jutro', 'dober večer', 'hej')) {
      return 'Pozdravljeni. Sem Maja. Vesela sem, da ste tukaj. Pomagam lahko pri vprašanjih o društvu, GBS, CIDP, članstvu, dokumentih ali pa preprosto prijazno poklepetam z vami.';
    }

    if (has('hvala', 'najlepša hvala')) {
      return 'Z veseljem. Tukaj sem, če želite nadaljevati ali vprašati še kaj drugega.';
    }

    if (has('kako si', 'kako ste')) {
      return 'Hvala za vprašanje. Tukaj sem, pripravljena, mirna in osredotočena na to, da vam pomagam čim bolj prijazno in jasno.';
    }

    if (has('vreme')) {
      return 'Trenutno nimam povezave do podatkov o vremenu v živo. Lahko pa vam pomagam pri drugih vprašanjih o društvu, GBS, CIDP ali vsakdanjih zadevah.';
    }

    if (has('kaj je gbs', 'gbs?', 'guillain', 'barré', 'barréjev')) {
      return 'GBS, Guillain-Barréjev sindrom, je redka avtoimunska bolezen, pri kateri imunski sistem napade periferni živčni sistem. Simptomi se navadno razvijejo hitro, v dneh do tednih, pogosto po okužbi. Med pogostimi znaki so mravljinčenje, šibkost v nogah, težave z ravnotežjem, bolečine ter v hujših primerih težave z dihanjem ali požiranjem. Ob hitrem poslabšanju je potrebna takojšnja zdravniška ocena.';
    }

    if (has('kaj je cidp', 'cidp?')) {
      return 'CIDP je kronična vnetna demielinizacijska polinevropatija. Gre za vnetno bolezen živcev, ki navadno poteka počasneje kot GBS, postopno ali v zagonih. Pogosti znaki so simetrična šibkost rok in nog, odrevenelost, mravljinčenje, zmanjšani refleksi, utrudljivost in negotov hod. Pogosto zahteva dolgoročnejšo nevrološko obravnavo.';
    }

    if (has('razlika', 'razlika med gbs in cidp')) {
      return 'Glavna razlika je v poteku bolezni. GBS običajno nastopi hitro in akutno, CIDP pa traja dlje časa, več kot 8 tednov, in poteka kronično ali v zagonih. Obe bolezni prizadeneta periferni živčni sistem, vendar je za natančno razlikovanje potreben nevrološki pregled.';
    }

    if (has('simptom', 'znaki gbs', 'znaki cidp', 'mravljinčenje', 'šibkost')) {
      return 'Pogosti simptomi pri GBS in CIDP so šibkost, mravljinčenje, odrevenelost, zmanjšani refleksi, težave z ravnotežjem in utrudljivost. Pri GBS se simptomi navadno razvijejo hitreje. Ob težavah z dihanjem, požiranjem, govorom ali nenadni nezmožnosti hoje je potrebna takojšnja zdravniška pomoč.';
    }

    if (has('zdravljenje', 'ivig', 'plazmafereza', 'kortikosteroidi', 'rehabilit')) {
      return 'Zdravljenje je odvisno od diagnoze in poteka bolezni. Pri GBS in CIDP se lahko uporabljajo IVIg, plazmafereza, pri CIDP tudi kortikosteroidi ali druga imunomodulacijska terapija. Pomemben del okrevanja sta fizioterapija in delovna terapija, pri dolgotrajnejših težavah pa tudi psihološka podpora.';
    }

    if (has('nujno', 'nujna pomoč', 'dihanje', 'požiranje', 'ne morem hoditi', 'ne more hoditi')) {
      return 'Ob hitrem slabšanju moči, težavah z dihanjem, požiranjem ali govorom, nenadni nezmožnosti hoje ali izraziti nestabilnosti je potrebna takojšnja zdravniška ocena. V nujnih primerih pokličite 112 ali se takoj obrnite na urgenco.';
    }

    if (has('član', 'članstvo', 'postanem član', 'včlanitev')) {
      return 'Včlanitev je namenjena osebam z GBS, CIDP ali sorodnim stanjem, njihovim svojcem, skrbnikom in tudi podpornim članom. Na spletni strani v razdelku Članstvo sta na voljo obrazca za rednega in podpornega člana, oddate pa lahko tudi povpraševanje preko pripravljenega e-poštnega obrazca.';
    }

    if (has('dokumenti', 'statut', 'zloženka', 'pristopna izjava', 'donacijska pogodba', 'sponzorska pogodba')) {
      return 'Na spletni strani so na voljo statut društva, informativni dokument, tridelna zloženka PDF, pristopna izjava za rednega člana, pristopna izjava za podpornega člana, donacijska pogodba in sponzorska pogodba. Najdete jih v razdelku Dokumenti in gradiva.';
    }

    if (has('kontakt', 'e-pošta', 'email', 'naslov društva')) {
      return 'Društvo lahko kontaktirate na e-pošto gbs.cidp.skupnost@gmail.com. Naslov društva je Studenec 70, 8293 Studenec, Slovenija.';
    }

    if (has('donacij', 'sponzor', 'prostovol')) {
      return 'Društvo lahko podprete z donacijo, sponzorstvom, prostovoljskim sodelovanjem ali deljenjem informacij. Na spletni strani sta na voljo donacijska in sponzorska pogodba, za prostovoljstvo pa se lahko oglasite po e-pošti.';
    }

    if (has('facebook')) {
      return 'Društvo ima tudi Facebook skupnost, kjer objavlja obvestila, novice in spodbudne vsebine za člane in širšo javnost.';
    }

    if (has('osamljen', 'strah', 'bojim', 'težko mi je', 'utrujen sem', 'utrujena sem')) {
      return 'Žal mi je, da vam je težko. Pri takih boleznih so utrudljivost, negotovost in čustvena obremenitev zelo pogosti. Niste sami. Če želite, lahko skupaj mirno predelava vprašanja o bolezni, rehabilitaciji, podpori svojcev ali korake, ki vam lahko pomagajo danes.';
    }

    return 'Z veseljem pomagam. Trenutno najbolje odgovarjam na vprašanja o društvu, članstvu, dokumentih, kontaktih, GBS, CIDP, rehabilitaciji, podpori in osnovnem vsakdanjem pogovoru. Vprašanje lahko tudi postavite bolj konkretno, na primer: Kaj je GBS?, Kako postanem član?, Kateri dokumenti so na voljo?';
  }

  async function getReply(text) {
    const apiConfigured = config.apiUrl && !/YOUR-BACKEND/i.test(config.apiUrl);
    if (!apiConfigured) {
      return { reply: fallbackReply(text), source: 'fallback' };
    }

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: state.history.slice(-12)
        })
      });
      if (!response.ok) throw new Error('Napaka strežnika');
      const data = await response.json();
      if (!data || !data.reply) throw new Error('Prazen odgovor');
      return data;
    } catch (err) {
      return {
        reply: fallbackReply(text) + ' Če želite še širše in pametnejše odgovore, preverite, ali je AI strežnik pravilno povezan v ozadju.',
        source: 'fallback'
      };
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage('user', text);
    state.history.push({ role: 'user', content: text });
    const typing = addMessage('assistant', '', { typing: true });
    setStatus(`${config.assistantName} razmišlja`);

    const data = await getReply(text);
    typing.remove();
    addMessage('assistant', data.reply || 'Trenutno nimam odgovora.');
    state.history.push({ role: 'assistant', content: data.reply || '' });

    const played = data.audioBase64 ? playAudio(data.audioBase64, data.audioMimeType) : false;
    if (!played) {
      setStatus('Odgovor pripravljen');
      speakText(data.reply || 'Odgovor je pripravljen.');
    }
  }

  config.suggestions.forEach((s) => {
    const chip = document.createElement('button');
    chip.className = 'gbs-ai-chip';
    chip.type = 'button';
    chip.textContent = s;
    chip.addEventListener('click', () => {
      input.value = s;
      sendMessage();
    });
    suggestionsWrap.appendChild(chip);
  });

  launcher.addEventListener('click', () => openAssistant());
  closeBtn.addEventListener('click', closeAssistant);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  document.querySelectorAll('[data-open-assistant]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt') || '';
      openAssistant(prompt);
    });
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    state.recognizer = new SpeechRecognition();
    state.recognizer.lang = 'sl-SI';
    state.recognizer.interimResults = false;
    state.recognizer.maxAlternatives = 1;

    state.recognizer.addEventListener('start', () => {
      state.isListening = true;
      micBtn.classList.add('active');
      setStatus('Poslušam vas', 'gbs-ai-listening');
    });

    state.recognizer.addEventListener('result', (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ');
      input.value = transcript;
      sendMessage();
    });

    state.recognizer.addEventListener('end', () => {
      state.isListening = false;
      micBtn.classList.remove('active');
      setStatus('Pripravljena za pogovor');
    });

    micBtn.addEventListener('click', () => {
      if (state.isListening) state.recognizer.stop();
      else state.recognizer.start();
    });
  } else {
    micBtn.disabled = true;
    micBtn.title = 'Ta brskalnik ne podpira glasovnega vnosa';
  }

  if (state.synth) {
    state.synth.onvoiceschanged = () => pickVoice();
  }

  if (config.autoOpen) openAssistant();
})();
