(() => {
  "use strict";

  const config = window.WEDDING_CONFIG || {};

  const get = (path) => path.split(".").reduce((obj, key) => obj?.[key], config);

  function applyTheme() {
    const root = document.documentElement;
    const themeMap = {
      background: "--bg",
      surface: "--surface",
      surfaceAlt: "--surface-alt",
      text: "--text",
      muted: "--muted",
      accent: "--accent",
      accentDark: "--accent-dark",
      accentSoft: "--accent-soft",
      line: "--line",
      heroText: "--hero-text"
    };

    Object.entries(themeMap).forEach(([key, cssVar]) => {
      if (config.theme?.[key]) root.style.setProperty(cssVar, config.theme[key]);
    });

    if (config.fonts?.title) root.style.setProperty("--font-title", config.fonts.title);
    if (config.fonts?.body) root.style.setProperty("--font-body", config.fonts.body);
  }

  function bindText() {
    document.querySelectorAll("[data-text]").forEach((element) => {
      const value = get(element.dataset.text);
      if (value !== undefined && value !== null) element.textContent = value;
    });
  }

  function setupOpening() {
    const opening = document.getElementById("opening");
    const button = document.getElementById("openInvitation");

    if (!config.opening?.enabled) {
      opening?.remove();
      document.body.classList.remove("is-locked");
      return;
    }

    button?.addEventListener("click", () => {
      opening.classList.add("is-hidden");
      document.body.classList.remove("is-locked");
      window.setTimeout(() => opening.remove(), 650);
    });
  }

  function setupImagesAndOptionalSections() {
    const hero = document.getElementById("heroImage");
    if (hero && config.hero?.image) hero.src = config.hero.image;

    const storySection = document.getElementById("historia");
    if (!config.story?.enabled) storySection?.remove();
    else {
      const image = document.getElementById("storyImage");
      if (image && config.story?.image) image.src = config.story.image;
    }

    if (!config.schedule?.enabled) document.getElementById("programacao")?.remove();
    if (!config.gallery?.enabled) document.getElementById("galeria")?.remove();
  }

  function setupCountdown() {
    const target = new Date(config.wedding?.dateISO || "").getTime();
    if (!Number.isFinite(target)) return;

    const units = {
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

      if (units.days) units.days.textContent = String(days).padStart(2, "0");
      if (units.hours) units.hours.textContent = String(hours).padStart(2, "0");
      if (units.minutes) units.minutes.textContent = String(minutes).padStart(2, "0");
      if (units.seconds) units.seconds.textContent = String(seconds).padStart(2, "0");
    };

    update();
    window.setInterval(update, 1000);
  }

  function renderEvents() {
    const container = document.getElementById("eventGrid");
    if (!container || !Array.isArray(config.events)) return;

    container.innerHTML = config.events.map((event) => `
      <article class="event-card">
        <div class="event-card__label">${escapeHtml(event.label)}</div>
        <div class="event-card__time">${escapeHtml(event.time)}</div>
        <div class="event-card__venue">
          <strong>${escapeHtml(event.venue)}</strong>
          <span>${escapeHtml(event.address)}</span>
        </div>
        <a class="event-card__link" href="${safeUrl(event.mapsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.mapsLabel || "Abrir mapa")}</a>
      </article>
    `).join("");
  }

  function renderSchedule() {
    const container = document.getElementById("timeline");
    if (!container || !Array.isArray(config.schedule?.items)) return;

    container.innerHTML = config.schedule.items.map((item) => `
      <article class="timeline__item">
        <div class="timeline__time">${escapeHtml(item.time)}</div>
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </div>
      </article>
    `).join("");
  }

  function renderGallery() {
    const container = document.getElementById("galleryGrid");
    if (!container || !Array.isArray(config.gallery?.images)) return;

    container.innerHTML = config.gallery.images.map((image, index) => `
      <figure class="gallery-card reveal" data-gallery-index="${index}" tabindex="0" role="button" aria-label="Ampliar ${escapeHtml(image.caption || `foto ${index + 1}`)}">
        <img src="${safeLocalPath(image.src)}" alt="${escapeHtml(image.alt || "Foto do casal")}" loading="lazy">
        <figcaption>${escapeHtml(image.caption || "")}</figcaption>
      </figure>
    `).join("");

    const openAt = (index) => {
      const item = config.gallery.images[index];
      const lightbox = document.getElementById("lightbox");
      const image = document.getElementById("lightboxImage");
      const caption = document.getElementById("lightboxCaption");
      if (!item || !lightbox || !image) return;
      image.src = item.src;
      image.alt = item.alt || "Foto do casal";
      if (caption) caption.textContent = item.caption || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    container.querySelectorAll("[data-gallery-index]").forEach((card) => {
      card.addEventListener("click", () => openAt(Number(card.dataset.galleryIndex)));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openAt(Number(card.dataset.galleryIndex));
        }
      });
    });

    const close = () => {
      const lightbox = document.getElementById("lightbox");
      if (!lightbox) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    document.getElementById("lightboxClose")?.addEventListener("click", close);
    document.getElementById("lightbox")?.addEventListener("click", (event) => {
      if (event.target.id === "lightbox") close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  function setupCalendar() {
    document.getElementById("calendarButton")?.addEventListener("click", () => {
      const start = toICSDate(config.wedding?.dateISO);
      const end = toICSDate(config.wedding?.endISO || config.wedding?.dateISO);
      if (!start || !end) return;

      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Convite Nivel 2//PT-BR",
        "BEGIN:VEVENT",
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${icsEscape(config.wedding?.calendarTitle || "Casamento")}`,
        `DESCRIPTION:${icsEscape(config.wedding?.calendarDescription || "")}`,
        `LOCATION:${icsEscape(config.wedding?.calendarLocation || config.wedding?.city || "")}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ];

      const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "casamento.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  function setupRsvp() {
    const form = document.getElementById("rsvpForm");
    const status = document.getElementById("rsvpStatus");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const nome = String(data.get("nome") || "").trim();
      const presenca = String(data.get("presenca") || "").trim();
      const convidados = String(data.get("convidados") || "1").trim();
      const mensagem = String(data.get("mensagem") || "").trim();

      if (!nome || !presenca) {
        if (status) status.textContent = "Preencha seu nome e selecione a confirmação.";
        return;
      }

      const parts = [
        config.rsvp?.baseMessage || "Olá! Estou respondendo ao convite.",
        "",
        `Nome: ${nome}`,
        `Resposta: ${presenca}`,
        `Número de pessoas: ${convidados}`
      ];
      if (mensagem) parts.push(`Mensagem: ${mensagem}`);

      const number = String(config.rsvp?.whatsappNumber || "").replace(/\D/g, "");
      if (!number) {
        if (status) status.textContent = "Modo demonstração: adicione o WhatsApp em js/config.js para ativar o envio.";
        return;
      }

      const url = `https://wa.me/${number}?text=${encodeURIComponent(parts.join("\n"))}`;
      window.open(url, "_blank", "noopener,noreferrer");
      if (status) status.textContent = "Abrimos o WhatsApp com sua confirmação.";
    });
  }

  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });

    items.forEach((item) => observer.observe(item));
  }

  function toICSDate(value) {
    const date = new Date(value || "");
    if (!Number.isFinite(date.getTime())) return "";
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function icsEscape(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
    })[char]);
  }

  function safeUrl(value) {
    const url = String(value || "#").trim();
    return /^(https?:\/\/)/i.test(url) ? url.replace(/"/g, "%22") : "#";
  }

  function safeLocalPath(value) {
    return String(value || "").replace(/["<>]/g, "");
  }

  applyTheme();
  bindText();
  setupImagesAndOptionalSections();
  setupOpening();
  setupCountdown();
  renderEvents();
  renderSchedule();
  renderGallery();
  setupCalendar();
  setupRsvp();
  setupReveal();
})();
