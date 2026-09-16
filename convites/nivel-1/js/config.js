/*
  ============================================================
  CONVITE DE CASAMENTO — NÍVEL 1
  ============================================================
  Edite este arquivo para personalizar o convite.
  Na maior parte dos casos, você não precisa alterar HTML ou CSS.
*/

window.WEDDING_CONFIG = {
  theme: {
    background: "#F7F3ED",
    surface: "#FFFDFC",
    text: "#2C2925",
    muted: "#756F67",
    accent: "#7C6A58",
    accentDark: "#59493C",
    heroText: "#FFFFFF"
  },

  fonts: {
    title: '"Cormorant Garamond", Georgia, serif',
    body: '"Poppins", Arial, sans-serif'
  },

  couple: {
    firstName: "Liliane",
    secondName: "Igor",
    initials: "L · I"
  },

  wedding: {
    dateISO: "2027-04-03T17:00:00-03:00",
    longDate: "03 de Abril de 2027",
    shortDate: "03 · 04 · 2027",
    weekday: "Sábado",
    time: "17h00",
    city: "Itu · São Paulo"
  },

  hero: {
    image: "assets/images/hero.jpg",
    eyebrow: "Nós vamos nos casar",
    buttonLabel: "Ver detalhes"
  },

  invitation: {
    eyebrow: "Nosso convite",
    title: "Queremos celebrar esse momento com você.",
    text: "Depois de tantos caminhos compartilhados, chegou o momento de abrirmos um novo capítulo. Será uma alegria ter você conosco nesse dia tão especial."
  },

  events: [
    {
      label: "Cerimônia",
      time: "17h00 · chegada a partir das 16h30min",
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

  rsvp: {
    eyebrow: "Confirmação",
    title: "Esperamos você!",
    text: "Para nos ajudar com a organização, confirme sua presença até 10 de Março de 2027.",
    buttonLabel: "Confirmar pelo WhatsApp",

    /*
      Coloque apenas números, com país + DDD.
      Exemplo: 5511999999999
      Se deixar vazio, o botão entra em modo demonstração.
    */
    whatsappNumber: "",

    whatsappMessage: "Olá! Gostaria de confirmar minha presença no casamento de Liliane e Igor."
  },

  footer: {
    text: "Com carinho, Liliane & Igor"
  }
};
