/*
  ============================================================
  CONVITE DE CASAMENTO — NÍVEL 2
  ============================================================
  Este é o arquivo principal de personalização do projeto.
  Para adaptar o convite para outro casal, normalmente basta:

  1. trocar os textos abaixo;
  2. substituir as imagens em assets/images/;
  3. configurar o número do WhatsApp.

  Não é necessário editar o HTML para as alterações comuns.
*/

window.WEDDING_CONFIG = {
  theme: {
    background: "#F4F2ED",
    surface: "#FBFAF7",
    surfaceAlt: "#E9ECE9",
    text: "#26302D",
    muted: "#6B7470",
    accent: "#70857D",
    accentDark: "#40564F",
    accentSoft: "#D9E1DD",
    line: "#D9D8D1",
    heroText: "#FFFFFF"
  },

  fonts: {
    title: '"Cormorant Garamond", Georgia, serif',
    body: '"Manrope", Arial, sans-serif'
  },

  couple: {
    firstName: "Liliane",
    secondName: "Igor",
    initials: "L · I",
    signature: "Liliane & Igor"
  },

  wedding: {
    dateISO: "2027-04-03T17:00:00-03:00",
    endISO: "2027-04-03T23:30:00-03:00",
    longDate: "03 de Abril de 2027",
    shortDate: "03 · 04 · 2027",
    weekday: "Sábado",
    time: "17h00",
    city: "Itu · São Paulo",
    calendarTitle: "Casamento — Liliane & Igor",
    calendarDescription: "Celebração do casamento de Liliane e Igor.",
    calendarLocation: "Paróquia São Luís Gonzaga — Itu, SP"
  },

  opening: {
    enabled: true,
    eyebrow: "Convite de casamento",
    text: "Um dia especial se aproxima.",
    buttonLabel: "Abrir convite"
  },

  hero: {
    image: "assets/images/hero.jpg",
    eyebrow: "Nós vamos nos casar",
    subtitle: "E queremos celebrar esse momento ao lado de pessoas especiais.",
    buttonLabel: "Conheça os detalhes"
  },

  invitation: {
    eyebrow: "Nosso convite",
    title: "Um novo capítulo começa aqui.",
    text: "Depois de tantos caminhos compartilhados, chegou o momento de abrirmos um novo capítulo. Será uma alegria ter você conosco para celebrar esse dia tão importante.",
    note: "Guarde a data e venha viver esse momento com a gente."
  },

  story: {
    enabled: true,
    eyebrow: "Um pouco sobre nós",
    title: "O acaso virou escolha. A escolha virou casa.",
    image: "assets/images/story.jpg",
    text: "Tudo começou sem grandes planos: uma conversa que durou mais do que deveria, um café que virou jantar e a sensação de que o tempo passava diferente quando estávamos juntos. Vieram viagens, mudanças e a certeza tranquila de que queríamos continuar escolhendo um ao outro.",
    caption: "Nossa história, do nosso jeito."
  },

  events: [
    {
      label: "Cerimônia",
      time: "17h00 · chegada a partir das 16h30",
      venue: "Paróquia São Luís Gonzaga",
      address: "R. Leonardo Piunti, 475 — São Luiz, Itu — SP",
      mapsUrl: "https://maps.app.goo.gl/cBcnP7PYY2Ed3Zdf9",
      mapsLabel: "Abrir no mapa"
    },
    {
      label: "Recepção",
      time: "19h00 · após a cerimônia",
      venue: "Paróquia São Luís Gonzaga",
      address: "R. Leonardo Piunti, 475 — São Luiz, Itu — SP",
      mapsUrl: "https://maps.app.goo.gl/cBcnP7PYY2Ed3Zdf9",
      mapsLabel: "Como chegar"
    }
  ],

  schedule: {
    enabled: true,
    eyebrow: "Programação",
    title: "O roteiro do nosso dia",
    note: "Os horários podem sofrer pequenos ajustes conforme o andamento da celebração.",
    items: [
      { time: "16:30", title: "Boas-vindas", text: "Chegue com calma e encontre seu lugar." },
      { time: "17:00", title: "Cerimônia", text: "O momento do nosso sim." },
      { time: "19:00", title: "Recepção", text: "Brindes, encontros e celebração." },
      { time: "20:30", title: "Jantar", text: "Um momento preparado para compartilhar à mesa." }
    ]
  },

  gallery: {
    enabled: true,
    eyebrow: "Memórias",
    title: "Alguns capítulos antes do grande dia.",
    images: [
      { src: "assets/images/gallery-1.jpg", alt: "Foto do casal", caption: "Nós dois" },
      { src: "assets/images/gallery-2.jpg", alt: "Foto do casal", caption: "Entre viagens e planos" },
      { src: "assets/images/gallery-3.jpg", alt: "Foto do casal", caption: "Até aqui" }
    ]
  },

  rsvp: {
    eyebrow: "Confirmação de presença",
    title: "Você vem celebrar com a gente?",
    text: "Preencha os dados abaixo. Ao enviar, abriremos o WhatsApp com a confirmação pronta para ser enviada.",
    deadline: "10 de Março de 2027",
    buttonLabel: "Enviar pelo WhatsApp",

    /*
      Coloque somente números com país + DDD.
      Ex.: 5511999999999
      Se ficar vazio, o formulário funciona em modo demonstração.
    */
    whatsappNumber: "",
    baseMessage: "Olá! Estou respondendo ao convite de casamento de Liliane e Igor."
  },

  footer: {
    text: "Esperamos você para celebrar esse capítulo com a gente."
  }
};
