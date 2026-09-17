/*
  ============================================================
  CONVITE DE CASAMENTO — NÍVEL 3
  ============================================================
  Arquivo principal de personalização.

  Para criar um novo convite, normalmente basta editar este
  arquivo e substituir as imagens em assets/images/.

  O Nível 3 foi pensado como um produto premium sem backend:
  - convite personalizado pelo nome do convidado;
  - história, programação, galeria, dress code e FAQ;
  - RSVP por WhatsApp ou formulário externo;
  - calendário e compartilhamento;
  - sem lista de presentes ou PIX; com música opcional e integração ao painel de convidados.
*/

window.WEDDING_THEMES = {
  sage: {
    background: "#F5F2EC",
    surface: "#FFFDF9",
    surfaceAlt: "#E9EEE9",
    text: "#25302A",
    muted: "#68736C",
    accent: "#718274",
    accentDark: "#425247",
    accentSoft: "#DCE4DC",
    warm: "#B28B70",
    line: "#D9DDD8",
    heroText: "#FFFFFF"
  },
  champagne: {
    background: "#F8F2E9",
    surface: "#FFFDF8",
    surfaceAlt: "#F0E5D6",
    text: "#30271F",
    muted: "#776A60",
    accent: "#AA8865",
    accentDark: "#71583F",
    accentSoft: "#EADBC8",
    warm: "#C19A6B",
    line: "#E1D5C8",
    heroText: "#FFFFFF"
  },
  dusk: {
    background: "#F2F1F5",
    surface: "#FCFBFE",
    surfaceAlt: "#E6E3EC",
    text: "#2B2732",
    muted: "#726B7B",
    accent: "#756B86",
    accentDark: "#4C435D",
    accentSoft: "#DED9E8",
    warm: "#B78F82",
    line: "#D8D3DE",
    heroText: "#FFFFFF"
  }
};

window.WEDDING_CONFIG = {
  themePreset: "sage",

  fonts: {
    title: '"Cormorant Garamond", Georgia, serif',
    body: '"Manrope", Arial, sans-serif'
  },

  couple: {
    firstName: "Liliane",
    secondName: "Igor",
    initials: "L · I",
    signature: "Com amor, Liliane & Igor"
  },

  wedding: {
    dateISO: "2027-04-03T17:00:00-03:00",
    endISO: "2027-04-03T23:30:00-03:00",
    longDate: "03 de Abril de 2027",
    shortDate: "03 · 04 · 2027",
    weekday: "Sábado",
    day: "03",
    month: "Abril",
    year: "2027",
    time: "17h00",
    city: "Itu · São Paulo",
    calendarTitle: "Casamento — Liliane & Igor",
    calendarDescription: "Celebração do casamento de Liliane e Igor.",
    calendarLocation: "Paróquia São Luís Gonzaga — Itu, SP"
  },

  opening: {
    enabled: true,
    eyebrow: "Você recebeu um convite especial",
    title: "Queremos celebrar este dia com você.",
    hint: "Um capítulo importante da nossa história está prestes a começar.",
    buttonLabel: "Abrir convite",
    guestQueryParam: "convidado",
    guestPrefix: "Convite destinado a"
  },

  hero: {
    image: {
      desktop: "assets/images/hero.jpg",
      mobile: "assets/images/hero.jpg"
    },
    eyebrow: "Save the date",
    subtitle: "Uma celebração de amor, encontros e novos começos.",
    primaryButton: "Confirmar presença",
    secondaryButton: "Ver detalhes"
  },

  welcome: {
    eyebrow: "Nosso convite",
    title: "Um dia para guardar na memória.",
    text: "Depois de tantos caminhos compartilhados, chegou o momento de abrirmos um novo capítulo. Queremos viver esse dia ao lado das pessoas que fizeram parte da nossa história — e você é uma delas."
  },

  story: {
    enabled: true,
    eyebrow: "Nossa história",
    title: "O acaso virou escolha. A escolha virou casa.",
    image: {
      desktop: "assets/images/story.jpg",
      mobile: "assets/images/story.jpg"
    },
    year: "desde 2023",
    paragraphs: [
      "Tudo começou sem grandes planos: uma conversa que durou mais do que deveria, um café que virou jantar e a sensação de que o tempo passava diferente quando estávamos juntos.",
      "Vieram viagens, mudanças, planos e a certeza tranquila de que queríamos continuar escolhendo um ao outro. Agora, queremos celebrar essa escolha com quem torna nossa história ainda mais especial."
    ],
    quote: "Algumas histórias começam por acaso. As melhores continuam por escolha."
  },

  events: [
    {
      label: "Cerimônia",
      time: "17h00 · chegada a partir das 16h30",
      venue: "Paróquia São Luís Gonzaga",
      address: "R. Leonardo Piunti, 475 — São Luiz, Itu — SP",
      mapsUrl: "https://maps.app.goo.gl/cBcnP7PYY2Ed3Zdf9",
      mapsLabel: "Abrir no mapa",
      image: {
        desktop: "assets/images/story.jpg",
        mobile: "assets/images/story.jpg"
      }
    },
    {
      label: "Recepção",
      time: "19h00 · após a cerimônia",
      venue: "Paróquia São Luís Gonzaga",
      address: "R. Leonardo Piunti, 475 — São Luiz, Itu — SP",
      mapsUrl: "https://maps.app.goo.gl/cBcnP7PYY2Ed3Zdf9",
      mapsLabel: "Como chegar",
      image: {
        desktop: "assets/images/gallery-4.jpg",
        mobile: "assets/images/gallery-4.jpg"
      }
    }
  ],

  schedule: {
    enabled: true,
    eyebrow: "Programação",
    title: "O roteiro do nosso dia",
    note: "Os horários podem receber pequenos ajustes conforme o andamento da celebração.",
    backgroundImage: {
      desktop: "assets/images/gallery-2.jpg",
      mobile: "assets/images/gallery-2.jpg"
    },
    items: [
      { time: "16:30", title: "Boas-vindas", text: "Chegue com calma e encontre seu lugar.", image: { desktop: "assets/images/gallery-1.jpg", mobile: "assets/images/gallery-1.jpg" } },
      { time: "17:00", title: "Cerimônia", text: "O momento do nosso sim.", image: { desktop: "assets/images/story.jpg", mobile: "assets/images/story.jpg" } },
      { time: "19:00", title: "Recepção", text: "Brindes, encontros e celebração.", image: { desktop: "assets/images/gallery-4.jpg", mobile: "assets/images/gallery-4.jpg" } },
      { time: "20:30", title: "Jantar", text: "Um momento preparado para compartilhar à mesa.", image: { desktop: "assets/images/gallery-5.jpg", mobile: "assets/images/gallery-5.jpg" } },
      { time: "21:00", title: "Pista aberta", text: "Hora de comemorar sem pressa.", image: { desktop: "assets/images/gallery-3.jpg", mobile: "assets/images/gallery-3.jpg" } }
    ]
  },

  gallery: {
    enabled: true,
    eyebrow: "Memórias",
    title: "Alguns capítulos antes do grande dia.",
    images: [
      { src: "assets/images/gallery-1.jpg", alt: "Foto do casal", caption: "Capítulo 01" },
      { src: "assets/images/gallery-2.jpg", alt: "Foto do casal", caption: "Capítulo 02" },
      { src: "assets/images/gallery-3.jpg", alt: "Foto do casal", caption: "Capítulo 03" },
      { src: "assets/images/gallery-4.jpg", alt: "Foto do casal", caption: "Capítulo 04" },
      { src: "assets/images/gallery-5.jpg", alt: "Foto do casal", caption: "Capítulo 05" }
    ]
  },

  dressCode: {
    enabled: true,
    eyebrow: "Dress code",
    title: "Esporte fino",
    text: "Elegante, leve e confortável. Queremos que você se sinta à vontade para aproveitar cada momento da celebração.",
    note: "Pedimos carinho especial para que branco, off-white, champagne e tons muito claros fiquem reservados para a noiva.",
    image: "assets/images/dress-code.jpg",
    palette: ["#3F4C39", "#7A8469", "#B8A58B", "#C9B8A4", "#4F3931"]
  },

  guestInfo: {
    enabled: true,
    eyebrow: "Para você se organizar",
    title: "Informações importantes",
    items: [
      { icon: "car", title: "Estacionamento", text: "Haverá estacionamento no local. Se for beber, considere táxi ou aplicativo." },
      { icon: "clock", title: "Pontualidade", text: "A cerimônia começa às 17h00. Recomendamos chegar com 30 minutos de antecedência." },
      { icon: "camera", title: "Fotos", text: "Registre e compartilhe os momentos, mantendo o corredor livre durante a cerimônia." }
    ]
  },

  faq: {
    enabled: true,
    eyebrow: "Dúvidas frequentes",
    title: "Antes do grande dia",
    items: [
      { question: "Posso levar acompanhante?", answer: "Considere apenas os nomes indicados no convite. Caso exista acompanhante liberado, essa informação pode ser combinada com os noivos." },
      { question: "Até quando preciso confirmar presença?", answer: "Pedimos que a confirmação seja feita até 10 de Março de 2027 para facilitar a organização do evento." },
      { question: "A cerimônia e a recepção são no mesmo local?", answer: "Neste exemplo, sim. Caso seu evento tenha locais diferentes, basta cadastrar ambos no arquivo de configuração." },
      { question: "Vai ter estacionamento?", answer: "Sim. As orientações podem ser personalizadas nesta seção para cada evento." }
    ]
  },

  rsvp: {
    enabled: true,
    eyebrow: "Confirmação de presença",
    title: "Você vem celebrar com a gente?",
    text: "Sua resposta é muito importante para organizarmos cada detalhe com carinho.",
    deadline: "10 de Março de 2027",
    buttonLabel: "Enviar confirmação",

    /* MODOS: "whatsapp", "form" ou "demo" */
    mode: "demo",

    /* WhatsApp: somente números, com país + DDD. Ex.: 5511999999999 */
    whatsappNumber: "",

    /* Formulário externo, por exemplo Formspree. */
    formAction: "",
    successMessage: "Obrigada! Sua confirmação foi recebida.",

    maxGuestsDefault: 4,
    guestLimitQueryParam: "lugares",
    baseMessage: "Olá! Estou respondendo ao convite de casamento de Liliane e Igor."
  },

  music: {
    enabled: true,
    file: "assets/audio/musica.mp3",
    volume: 0.55,
    labelPlay: "Tocar música",
    labelPause: "Pausar música"
  },

  sharing: {
    enabled: false,
    title: "Convite de casamento — Liliane & Igor",
    text: "Você é nosso convidado para celebrar este dia com a gente."
  },

  /*
    SISTEMA DE CONVIDADOS
    ---------------------
    mode: "demo" permite testar sem banco.
    mode: "api" usa a Edge Function do Supabase.
    O convidado chega por ?convite=TOKEN.
  */
  guestSystem: {
    enabled: true,
    mode: "api", // "demo" ou "api"
    tokenQueryParam: "convite",
    endpoint: "https://oblucxwvsouyjhfqaten.supabase.co/functions/v1/invite-public",
    demoInvites: {
      "DEMO-FAMILIA-SILVA": { displayName: "Família Silva", seats: 4, members: ["João Silva", "Maria Silva", "Pedro Silva", "Ana Silva"] },
      "DEMO-MARIA-SOUZA": { displayName: "Maria Souza", seats: 1, members: ["Maria Souza"] },
      "DEMO-PEDRO-ANA": { displayName: "Pedro & Ana", seats: 2, members: ["Pedro Costa", "Ana Costa"] }
    }
  },

  images: {
    rsvp: {
      desktop: "assets/images/rsvp.jpg",
      mobile: "assets/images/rsvp.jpg"
    }
  },

  footer: {
    text: "Esperamos você para celebrar este capítulo com a gente."
  }
};
