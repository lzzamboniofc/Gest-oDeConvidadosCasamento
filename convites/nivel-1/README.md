# Convite de Casamento — Nível 1

Versão simples do produto de convite/site de casamento.

## O que este nível inclui

- capa com foto, nomes, data e cidade;
- mensagem de convite;
- contagem regressiva;
- informações de cerimônia e recepção;
- botões para mapa;
- confirmação simples pelo WhatsApp;
- layout responsivo para celular e desktop;
- configuração centralizada em `js/config.js`.

## O que NÃO faz parte do Nível 1

Esses itens ficam reservados para níveis superiores:

- abertura personalizada por convidado;
- história do casal;
- galeria de fotos;
- programação/timeline;
- dress code;
- informações extras aos convidados;
- FAQ;
- lista de presentes/PIX;
- música;
- formulário avançado de RSVP;
- painel de convidados.

## Como personalizar

Abra `js/config.js`.

Você pode alterar em um único arquivo:

- cores;
- fontes;
- nomes e iniciais;
- data, horário e cidade;
- foto da capa;
- mensagem principal;
- locais do evento;
- links do Google Maps;
- texto e número do WhatsApp para RSVP;
- texto do rodapé.

## Foto principal

A imagem padrão fica em:

`assets/images/hero.jpg`

Você pode substituir o arquivo mantendo o mesmo nome, ou editar `hero.image` no `config.js`.

## WhatsApp

Em `js/config.js`, procure:

```js
whatsappNumber: ""
```

Use apenas números, incluindo código do país e DDD. Exemplo:

```js
whatsappNumber: "5511999999999"
```

Se o número ficar vazio, o convite continua funcionando em modo demonstração.

## Estrutura

```text
ConviteCasamento-Nivel1/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── main.js
└── assets/
    └── images/
        ├── hero.jpg
        └── favicon.svg
```
