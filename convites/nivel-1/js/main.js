(() => {
  const config = window.WEDDING_CONFIG;
  if (!config) return;

  const getValue = (path) => path.split(".").reduce((acc, key) => acc?.[key], config);

  function applyTheme() {
    const root = document.documentElement;
    const t = config.theme || {};
    const f = config.fonts || {};
    const vars = {
      "--bg": t.background,
      "--surface": t.surface,
      "--text": t.text,
      "--muted": t.muted,
      "--accent": t.accent,
      "--accent-dark": t.accentDark,
      "--hero-text": t.heroText,
      "--title-font": f.title,
      "--body-font": f.body
    };
    Object.entries(vars).forEach(([name, value]) => {
      if (value) root.style.setProperty(name, value);
    });
  }

  function fillText() {
    document.querySelectorAll("[data-text]").forEach((el) => {
      const value = getValue(el.dataset.text);
      if (value !== undefined && value !== null) el.textContent = value;
    });
  }

  function setHero() {
    const image = document.getElementById("heroImage");
    if (image && config.hero?.image) image.src = config.hero.image;
    if (config.couple && config.wedding) {
      document.title = `Casamento de ${config.couple.firstName} & ${config.couple.secondName}`;
    }
  }

  function renderEvents() {
    const grid = document.getElementById("eventGrid");
    if (!grid) return;
    grid.innerHTML = "";

    (config.events || []).forEach((event) => {
      const article = document.createElement("article");
      article.className = "event-card";

      const label = document.createElement("p");
      label.className = "event-card__label";
      label.textContent = event.label || "Evento";

      const title = document.createElement("h3");
      title.textContent = event.venue || "";

      const time = document.createElement("p");
      time.className = "event-card__time";
      time.textContent = event.time || "";

      const address = document.createElement("p");
      address.className = "event-card__address";
      address.textContent = event.address || "";

      article.append(label, title, time, address);

      if (event.mapsUrl) {
        const link = document.createElement("a");
        link.className = "event-card__link";
        link.href = event.mapsUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `${event.mapsLabel || "Abrir no mapa"} →`;
        article.append(link);
      }

      grid.append(article);
    });
  }

  function startCountdown() {
    const target = new Date(config.wedding?.dateISO || "").getTime();
    if (!Number.isFinite(target)) return;

    const fields = {
      days: document.querySelector('[data-count="days"]'),
      hours: document.querySelector('[data-count="hours"]'),
      minutes: document.querySelector('[data-count="minutes"]'),
      seconds: document.querySelector('[data-count="seconds"]')
    };

    const update = () => {
      const diff = Math.max(0, target - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (fields.days) fields.days.textContent = String(days).padStart(2, "0");
      if (fields.hours) fields.hours.textContent = String(hours).padStart(2, "0");
      if (fields.minutes) fields.minutes.textContent = String(minutes).padStart(2, "0");
      if (fields.seconds) fields.seconds.textContent = String(seconds).padStart(2, "0");
    };

    update();
    setInterval(update, 1000);
  }

  function setupRsvp() {
    const button = document.getElementById("rsvpButton");
    const status = document.getElementById("rsvpStatus");
    if (!button) return;

    button.addEventListener("click", () => {
      const number = String(config.rsvp?.whatsappNumber || "").replace(/\D/g, "");
      const message = config.rsvp?.whatsappMessage || "Olá! Gostaria de confirmar minha presença.";

      if (!number) {
        if (status) status.textContent = "Modo demonstração: adicione o número do WhatsApp em js/config.js.";
        return;
      }

      const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  applyTheme();
  fillText();
  setHero();
  renderEvents();
  startCountdown();
  setupRsvp();
})();
