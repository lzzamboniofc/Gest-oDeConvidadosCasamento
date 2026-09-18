# Convite de Casamento — Nível 3 Integrado

Convite premium conectado ao **Sistema de Convidados**. É a versão usada pelo painel para links individualizados por token.

## Recursos atuais

- abertura personalizada com nome/família do convidado;
- token individual `?convite=TOKEN`;
- limite de lugares e membros cadastrados no Supabase;
- RSVP salvo no banco e bloqueado depois da primeira resposta;
- mensagem para os noivos;
- modal de confirmação;
- capa, história, eventos, roteiro, galeria, dress code, informações e FAQ;
- troca de fundo no roteiro ao passar o mouse;
- calendário;
- mini player de música sem autoplay;
- imagens responsivas desktop/mobile;
- layout responsivo.

O botão de compartilhar o convite foi removido porque o link contém um token individual.

## Imagens desktop + mobile

Os principais pontos fotográficos aceitam duas artes. Exemplo em `js/config.js`:

```js
image: {
  desktop: "assets/images/hero-desktop.jpg",
  mobile: "assets/images/hero-mobile.jpg"
}
```

O breakpoint é **768 px**. Se ainda houver apenas uma foto, deixe os dois caminhos apontando para o mesmo arquivo.

Para imagens que cobrem grandes áreas com `cover`, uma boa referência é:

- desktop: aproximadamente **1920 × 1080**;
- mobile: aproximadamente **1080 × 1920**.

Hoje esse formato é aceito em: hero/abertura, história, cards de local, fundo do roteiro, cada item do roteiro, galeria, dress code e imagem do RSVP.

## Música

Configure no bloco `music` de `js/config.js`. O player não inicia automaticamente. O arquivo padrão fica em `assets/audio/musica.mp3`.

## Produção

O sistema integrado usa `guestSystem.mode: "api"` e a Edge Function `invite-public`. Nunca coloque secret/service-role key no convite.

Teste sem banco trocando temporariamente `guestSystem.mode` para `demo` e abrindo:

```text
index.html?convite=DEMO-FAMILIA-SILVA
```
