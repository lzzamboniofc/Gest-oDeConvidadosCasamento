# Convite de Casamento — Nível 3

Versão premium intermediária da coleção de convites.

## Proposta do Nível 3

O Nível 3 fica entre o Nível 2 e o projeto editorial completo (Nível 4). Ele mantém hospedagem simples, sem banco de dados próprio, mas oferece uma experiência mais sofisticada e personalizável.

### Incluído

- abertura elegante com nome do convidado pela URL;
- capa fotográfica com data e atalhos;
- contagem regressiva;
- história do casal;
- cerimônia e recepção com links de mapa;
- programação do evento;
- galeria com 5 fotos e lightbox;
- dress code com paleta de referência;
- informações aos convidados;
- FAQ;
- RSVP completo;
- limite de convidados configurável pela URL;
- RSVP via WhatsApp, formulário externo ou modo demonstração;
- botão para adicionar ao calendário;
- compartilhamento do convite;
- três presets de cores;
- layout responsivo.

### Não incluído neste nível

- lista de presentes / PIX;
- música de fundo;
- painel administrativo;
- banco de dados próprio;
- gestão de presentes;
- arquitetura editorial avançada do Nível 4.

## Onde editar

Quase toda a personalização fica em:

`js/config.js`

Troque nomes, data, cidade, textos, locais, programação, FAQ, RSVP, cores e caminhos das imagens nesse arquivo.

As imagens ficam em:

`assets/images/`

## Convite personalizado

Use o parâmetro `convidado`:

`index.html?convidado=Família%20Silva`

A abertura exibirá o nome e o campo de RSVP será preenchido automaticamente.

Também é possível limitar o número de pessoas pelo parâmetro `lugares`:

`index.html?convidado=Família%20Silva&lugares=3`

Nesse exemplo, o RSVP aceitará no máximo 3 pessoas.

## Temas

No `config.js` altere:

```js
themePreset: "sage"
```

Opções:

- `sage`
- `champagne`
- `dusk`

## RSVP

No `config.js`:

```js
mode: "demo"
```

Modos disponíveis:

- `demo` — não envia dados;
- `whatsapp` — cria uma mensagem e abre o WhatsApp;
- `form` — envia para um serviço externo, como Formspree.

Para WhatsApp, configure `whatsappNumber` somente com números, incluindo país e DDD.

## Estrutura

```text
ConviteCasamento-Nivel3/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── main.js
└── assets/
    └── images/
```
