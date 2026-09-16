# Convite de Casamento — Nível 2

Versão intermediária leve da linha de convites digitais.

O Nível 2 acrescenta experiência e conteúdo ao Nível 1 sem chegar aos recursos premium do Nível 3 e do Nível 4.

## O que está incluído

- abertura elegante do convite;
- capa fotográfica com nomes, data e cidade;
- mensagem principal + contagem regressiva;
- seção curta sobre a história do casal;
- cerimônia e recepção com links para mapa;
- programação resumida do dia;
- botão para adicionar o casamento ao calendário;
- galeria compacta com 3 fotos e lightbox;
- RSVP em formulário com envio pronto pelo WhatsApp;
- layout responsivo e mobile-first;
- cores, fontes, textos, imagens e dados centralizados em `js/config.js`.

## O que fica para níveis superiores

Este projeto não possui:

- convite individual pelo nome do convidado;
- dress code completo;
- informações avançadas aos convidados;
- FAQ;
- lista de presentes / PIX;
- música;
- painel administrativo ou banco de dados;
- RSVP com controle de convidados.

## Personalização

Abra:

```text
js/config.js
```

É o arquivo principal para editar:

- nomes do casal;
- data, horário e cidade;
- textos;
- cores;
- fontes;
- locais e mapas;
- programação;
- galeria;
- prazo de RSVP;
- número do WhatsApp.

### Imagens

Substitua os arquivos dentro de:

```text
assets/images/
```

Os caminhos também podem ser alterados no `config.js`.

### WhatsApp

No bloco `rsvp`, configure:

```js
whatsappNumber: "5511999999999"
```

Use somente números, incluindo o código do país e DDD.

Se o campo ficar vazio, o formulário permanece em modo de demonstração e não abre uma conversa real.

## Estrutura

```text
ConviteCasamento-Nivel2/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── main.js
└── assets/
    └── images/
        ├── favicon.svg
        ├── hero.jpg
        ├── story.jpg
        ├── gallery-1.jpg
        ├── gallery-2.jpg
        └── gallery-3.jpg
```

## Posicionamento sugerido

**Nível 1:** Essencial — informações principais + confirmação simples.

**Nível 2:** Intermediário — experiência mais completa, história, programação, fotos e RSVP por formulário/WhatsApp.

**Nível 3:** Premium — será desenvolvido separadamente com novos diferenciais.

**Nível 4:** projeto editorial completo atual.
