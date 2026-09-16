# Integração com o Sistema de Convidados — v1.3

O Nível 3 continua funcionando normalmente sem token. Quando recebe `?convite=TOKEN`, tenta carregar o cadastro individual.

## Teste DEMO

Abra:

`index.html?convite=DEMO-FAMILIA-SILVA`

A abertura será personalizada para **Família Silva**. Esse convite possui quatro membros de demonstração e o RSVP mostra uma seleção individual:

- João Silva
- Maria Silva
- Pedro Silva
- Ana Silva

Ao confirmar, os nomes marcados são gravados junto com a quantidade.

Convites que não possuem membros cadastrados continuam usando o campo tradicional **Nº de pessoas**.

## Produção

No `js/config.js`, altere:

```js
guestSystem: {
  enabled: true,
  mode: "api",
  tokenQueryParam: "convite",
  endpoint: "https://SEU-PROJETO.supabase.co/functions/v1/invite-public"
}
```

Não coloque chave secreta do Supabase no convite. O acesso público passa pela Edge Function e pelo token individual.
