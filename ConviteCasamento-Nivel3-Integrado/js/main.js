(async () => {
  const C = window.WEDDING_CONFIG || {};
  const themes = window.WEDDING_THEMES || {};
  const theme = themes[C.themePreset] || themes.sage || {};
  const root = document.documentElement;

  const cssVars = {
    background: '--bg', surface: '--surface', surfaceAlt: '--surface-alt', text: '--text', muted: '--muted',
    accent: '--accent', accentDark: '--accent-dark', accentSoft: '--accent-soft', warm: '--warm', line: '--line', heroText: '--hero-text'
  };
  Object.entries(cssVars).forEach(([key, variable]) => theme[key] && root.style.setProperty(variable, theme[key]));
  if (C.fonts?.title) root.style.setProperty('--title-font', C.fonts.title);
  if (C.fonts?.body) root.style.setProperty('--body-font', C.fonts.body);

  const get = (path) => path.split('.').reduce((obj, key) => obj?.[key], C);
  document.querySelectorAll('[data-text]').forEach(el => {
    const value = get(el.dataset.text);
    if (value !== undefined && value !== null) el.textContent = value;
  });

  document.title = `Casamento — ${C.couple.firstName} & ${C.couple.secondName}`;
  const metaTitle = document.querySelector('meta[property="og:title"]');
  const metaDesc = document.querySelector('meta[property="og:description"]');
  if (metaTitle) metaTitle.content = C.sharing?.title || document.title;
  if (metaDesc) metaDesc.content = C.sharing?.text || C.hero?.subtitle || '';

  const heroImage = document.getElementById('heroImage');
  const openingImage = document.getElementById('openingImage');
  if (heroImage && C.hero?.image) heroImage.src = C.hero.image;
  if (openingImage && C.hero?.image) openingImage.src = C.hero.image;

  const params = new URLSearchParams(location.search);
  let invitationContext = null;
  try { invitationContext = await window.GuestSystem?.resolve(C.guestSystem); } catch (error) { console.warn(error); }
  const guestParam = C.opening?.guestQueryParam || 'convidado';
  const legacyGuestName = (params.get(guestParam) || '').trim();
  const guestName = invitationContext?.displayName || legacyGuestName;
  const greeting = document.getElementById('personalGreeting');
  if (greeting) greeting.textContent = guestName ? `${C.opening.guestPrefix} ${guestName}` : '';
  const rsvpName = document.getElementById('rsvpName');
  if (rsvpName && guestName) rsvpName.value = guestName;

  const opening = document.getElementById('opening');
  const openButton = document.getElementById('openInvitation');
  const header = document.getElementById('siteHeader');
  const openSite = () => {
    opening?.setAttribute('hidden', '');
    document.body.classList.remove('is-locked');
    header?.classList.add('is-visible');
  };
  if (C.opening?.enabled === false) openSite();
  else openButton?.addEventListener('click', openSite);

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); navToggle?.setAttribute('aria-expanded', 'false');
  }));

  const targetDate = new Date(C.wedding.dateISO).getTime();
  const updateCountdown = () => {
    const diff = Math.max(0, targetDate - Date.now());
    const values = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      minutes: Math.floor(diff / 60000) % 60,
      seconds: Math.floor(diff / 1000) % 60
    };
    Object.entries(values).forEach(([key, value]) => {
      const el = document.querySelector(`[data-count="${key}"]`);
      if (el) el.textContent = String(value).padStart(2, '0');
    });
  };
  updateCountdown(); setInterval(updateCountdown, 1000);

  const storyImage = document.getElementById('storyImage');
  if (storyImage && C.story?.image) storyImage.src = C.story.image;
  const storyParagraphs = document.getElementById('storyParagraphs');
  if (storyParagraphs) (C.story?.paragraphs || []).forEach(text => {
    const p = document.createElement('p'); p.textContent = text; storyParagraphs.appendChild(p);
  });
  if (C.story?.enabled === false) document.getElementById('historia')?.remove();

  const eventGrid = document.getElementById('eventGrid');
  (C.events || []).forEach((event, index) => {
    const article = document.createElement('article'); article.className = 'event-card';
    article.innerHTML = `<span class="event-card__index">0${index + 1} · ${event.label}</span><h3>${event.venue}</h3><p class="event-card__time">${event.time}</p><address>${event.address}</address><a href="${event.mapsUrl}" target="_blank" rel="noopener">${event.mapsLabel} →</a>`;
    eventGrid?.appendChild(article);
  });

  const timeline = document.getElementById('timeline');
  (C.schedule?.items || []).forEach(item => {
    const row = document.createElement('div'); row.className = 'timeline-item';
    row.innerHTML = `<time>${item.time}</time><div><h3>${item.title}</h3><p>${item.text}</p></div>`;
    timeline?.appendChild(row);
  });
  if (C.schedule?.enabled === false) document.getElementById('programacao')?.remove();

  const galleryGrid = document.getElementById('galleryGrid');
  const galleryImages = C.gallery?.images || [];
  galleryImages.forEach((image, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'gallery-item'; button.dataset.index = index;
    button.innerHTML = `<img src="${image.src}" alt="${image.alt || ''}" loading="lazy"><span>${image.caption || `Foto ${index + 1}`}</span>`;
    galleryGrid?.appendChild(button);
  });
  if (C.gallery?.enabled === false) document.getElementById('galeria')?.remove();

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let currentImage = 0;
  const showImage = (index) => {
    if (!galleryImages.length) return;
    currentImage = (index + galleryImages.length) % galleryImages.length;
    const img = galleryImages[currentImage];
    lightboxImage.src = img.src; lightboxImage.alt = img.alt || ''; lightboxCaption.textContent = img.caption || '';
  };
  const openLightbox = (index) => { showImage(index); lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden', 'false'); };
  const closeLightbox = () => { lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden', 'true'); };
  galleryGrid?.addEventListener('click', e => { const item = e.target.closest('.gallery-item'); if (item) openLightbox(Number(item.dataset.index)); });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => showImage(currentImage - 1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => showImage(currentImage + 1));
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (!lightbox?.classList.contains('is-open')) return; if (e.key === 'Escape') closeLightbox(); if (e.key === 'ArrowLeft') showImage(currentImage - 1); if (e.key === 'ArrowRight') showImage(currentImage + 1); });

  const dressImage = document.getElementById('dressImage');
  if (dressImage && C.dressCode?.image) dressImage.src = C.dressCode.image;
  const palette = document.getElementById('dressPalette');
  (C.dressCode?.palette || []).forEach(color => { const swatch = document.createElement('span'); swatch.style.background = color; palette?.appendChild(swatch); });
  if (C.dressCode?.enabled === false) document.getElementById('dress-code')?.remove();

  const iconMap = { car: '↗', clock: '◷', camera: '◎', heart: '♡' };
  const infoGrid = document.getElementById('infoGrid');
  (C.guestInfo?.items || []).forEach(item => {
    const card = document.createElement('article'); card.className = 'info-card';
    card.innerHTML = `<span class="info-card__icon">${iconMap[item.icon] || '•'}</span><h3>${item.title}</h3><p>${item.text}</p>`;
    infoGrid?.appendChild(card);
  });
  if (C.guestInfo?.enabled === false) document.getElementById('informacoes')?.remove();

  const faqList = document.getElementById('faqList');
  (C.faq?.items || []).forEach((item, index) => {
    const wrap = document.createElement('div'); wrap.className = 'faq-item';
    wrap.innerHTML = `<button class="faq-question" type="button" aria-expanded="false"><span>${item.question}</span><span>+</span></button><div class="faq-answer"><div><p>${item.answer}</p></div></div>`;
    const btn = wrap.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      const open = wrap.classList.toggle('is-open'); btn.setAttribute('aria-expanded', String(open)); btn.lastElementChild.textContent = open ? '−' : '+';
    });
    faqList?.appendChild(wrap);
  });
  if (C.faq?.enabled === false) document.getElementById('duvidas')?.remove();

  const rsvpImage = document.getElementById('rsvpImage');
  if (rsvpImage && C.images?.rsvp) rsvpImage.src = C.images.rsvp;
  const mealField = document.getElementById('mealField');
  if (mealField && C.rsvp?.collectMealPreference === false) mealField.remove();
  const guestCount = document.getElementById('guestCount');
  const guestCountField = document.getElementById('guestCountField');
  const memberSection = document.getElementById('rsvpMembers');
  const memberOptions = document.getElementById('rsvpMemberOptions');
  const limitParam = C.rsvp?.guestLimitQueryParam || 'lugares';
  const queryLimit = parseInt(params.get(limitParam), 10);
  const maxGuests = invitationContext?.seats || (Number.isFinite(queryLimit) && queryLimit > 0 ? queryLimit : (C.rsvp?.maxGuestsDefault || 4));
  if (guestCount) { guestCount.max = String(maxGuests); guestCount.value = String(Math.min(Number(guestCount.value || 1), maxGuests)); }
  const rsvpLimitNote = document.getElementById('rsvpLimitNote');
  if (rsvpLimitNote && invitationContext) rsvpLimitNote.textContent = `Este convite contempla até ${maxGuests} ${maxGuests === 1 ? 'pessoa' : 'pessoas'}.`;

  const invitationMembers = Array.isArray(invitationContext?.members) ? invitationContext.members.filter(Boolean) : [];
  if (invitationMembers.length && memberSection && memberOptions) {
    memberSection.hidden = false;
    if (guestCountField) guestCountField.hidden = true;
    memberOptions.innerHTML = invitationMembers.map(name => `<label class="member-option"><input type="checkbox" name="member_name" value="${String(name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}"><span>${String(name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span></label>`).join('');
    const syncMemberCount = () => { if (guestCount) guestCount.value = String(memberOptions.querySelectorAll('input[name="member_name"]:checked').length); };
    memberOptions.addEventListener('change', syncMemberCount);
  }

  if (invitationContext?.rsvp) {
    const previous = invitationContext.rsvp;
    if (rsvpName && (previous.submittedName || previous.submitted_name)) rsvpName.value = previous.submittedName || previous.submitted_name;
    const presence = document.querySelector('[name="presenca"]');
    if (presence) presence.value = previous.attending ? 'Sim, estarei presente' : 'Infelizmente não poderei ir';
    const previousNames = previous.guestNames || previous.guest_names || [];
    if (invitationMembers.length && memberOptions) {
      memberOptions.querySelectorAll('input[name="member_name"]').forEach(input => { input.checked = previousNames.includes(input.value); });
      if (guestCount) guestCount.value = String(previousNames.length || previous.guestCount || previous.guest_count || 0);
    } else if (guestCount) guestCount.value = String(previous.guestCount ?? previous.guest_count ?? 1);
    const meal = document.querySelector('[name="alimentacao"]'); if (meal) meal.value = previous.mealNotes || previous.meal_notes || '';
    const msg = document.querySelector('[name="mensagem"]'); if (msg) msg.value = previous.message || '';
  }

  const rsvpForm = document.getElementById('rsvpForm');
  const status = document.getElementById('formStatus');
  rsvpForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(rsvpForm);
    const payload = Object.fromEntries(data.entries());
    const mode = C.rsvp?.mode || 'demo';
    if (invitationContext && C.guestSystem?.enabled) {
      try {
        const attending = payload.presenca === 'Sim, estarei presente';
        const selectedMembers = invitationMembers.length ? data.getAll('member_name').map(String) : [];
        if (attending && invitationMembers.length && selectedMembers.length === 0) throw new Error('Selecione ao menos uma pessoa que estará presente.');
        const result = await window.GuestSystem.submit(C.guestSystem, invitationContext, {
          attending, guestCount: attending ? (invitationMembers.length ? selectedMembers.length : Number(payload.convidados || 1)) : 0, submittedName: payload.nome || guestName,
          mealNotes: payload.alimentacao || '', message: payload.mensagem || '', guestNames: attending ? selectedMembers : []
        });
        status.textContent = result.message || 'Confirmação registrada com sucesso.';
      } catch (error) { status.textContent = error.message || 'Não foi possível enviar. Tente novamente.'; }
      return;
    }
    if (mode === 'whatsapp' && C.rsvp.whatsappNumber) {
      const lines = [C.rsvp.baseMessage, '', `Nome: ${payload.nome}`, `Presença: ${payload.presenca}`, `Número de pessoas: ${payload.convidados}`];
      if (payload.alimentacao) lines.push(`Alimentação: ${payload.alimentacao}`);
      if (payload.mensagem) lines.push(`Mensagem: ${payload.mensagem}`);
      location.href = `https://wa.me/${C.rsvp.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
      return;
    }
    if (mode === 'form' && C.rsvp.formAction) {
      try {
        status.textContent = 'Enviando...';
        const response = await fetch(C.rsvp.formAction, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Falha no envio');
        status.textContent = C.rsvp.successMessage || 'Confirmação enviada.'; rsvpForm.reset();
      } catch { status.textContent = 'Não foi possível enviar. Tente novamente.'; }
      return;
    }
    status.textContent = `Modo demonstração: confirmação de ${payload.nome} preenchida corretamente.`;
  });
  if (C.rsvp?.enabled === false) document.getElementById('rsvp')?.remove();

  const toICSDate = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  document.getElementById('calendarButton')?.addEventListener('click', () => {
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Convite Nivel 3//PT-BR','BEGIN:VEVENT',`DTSTART:${toICSDate(C.wedding.dateISO)}`,`DTEND:${toICSDate(C.wedding.endISO)}`,`SUMMARY:${C.wedding.calendarTitle}`,`DESCRIPTION:${C.wedding.calendarDescription}`,`LOCATION:${C.wedding.calendarLocation}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'casamento.ics'; a.click(); URL.revokeObjectURL(a.href);
  });

  const shareButton = document.getElementById('shareButton');
  if (C.sharing?.enabled === false) shareButton?.remove();
  else shareButton?.addEventListener('click', async () => {
    const data = { title: C.sharing.title, text: C.sharing.text, url: location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); shareButton.textContent = 'Link copiado ✓'; } } catch (_) {}
  });

  const backTop = document.getElementById('backTop');
  const onScroll = () => backTop?.classList.toggle('is-visible', scrollY > innerHeight * .75);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  backTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
})();
