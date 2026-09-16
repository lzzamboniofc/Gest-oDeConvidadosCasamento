# Sistema de Convidados + Convite Nível 3 Integrado — v1.3

Este pacote contém:

- `controle-convidados/` — painel administrativo, login, importação/exportação Excel, SQL e Edge Function para Supabase;
- `ConviteCasamento-Nivel3-Integrado/` — cópia do Nível 3 preparada para usar `?convite=TOKEN` e membros individuais do convite.

Comece por `controle-convidados/README.md`.

## Novidades da v1.3

A v1.3 é focada em administração dos convidados:

- painel com métricas separando **convites**, **lugares** e **pessoas confirmadas**;
- taxa de resposta dos convites;
- cadastro opcional dos membros de cada família/convite;
- RSVP do convite integrado pode mostrar os membros e permitir selecionar exatamente quem irá;
- importação Excel aceita a nova coluna opcional `membros`;
- exportação da lista completa para **Excel (.xlsx)** e **CSV**;
- exportação inclui status, confirmados, nomes confirmados, restrição alimentar, mensagem, token e link personalizado;
- botão **Novo token**, que invalida o link anterior e gera um novo;
- edição e exclusão continuam disponíveis no painel;
- arquivo de migração `migration_v1_2_to_v1_3.sql` para quem já aplicou o banco da v1.2.

## Mantido das versões anteriores

- login por e-mail e senha com Supabase Auth;
- recuperação de senha;
- painel protegido e RLS no banco;
- múltiplos casamentos por conta;
- importação em lote com pré-validação;
- links individuais por token;
- compartilhamento pelo WhatsApp;
- RSVP por Edge Function;
- modo DEMO para testar antes de conectar um Supabase real.

## Fluxo final

1. O administrador entra em `admin/login.html`.
2. Cadastra ou importa **Família Silva — 4 lugares**.
3. Opcionalmente informa os membros: João, Maria, Pedro e Ana.
4. O painel gera um token e o link `https://site.com/?convite=TOKEN`.
5. O convidado abre o link sem login.
6. Se houver membros cadastrados, o RSVP permite marcar exatamente quem estará presente.
7. A resposta volta ao painel e entra nas métricas/exportações.

O `config.js` do convite continua responsável pelo design e conteúdo. Convidados, membros e respostas ficam no sistema de gestão.
