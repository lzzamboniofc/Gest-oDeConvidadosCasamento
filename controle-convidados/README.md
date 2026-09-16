# Sistema de Gestão de Convidados — v1.3

Sistema separado dos templates de convite. Administra casamentos, convites/famílias, membros, limite de lugares, links individuais e respostas de RSVP.

## v1.3 — Administração

### Métricas

A visão geral diferencia:

- quantidade de convites/famílias;
- total de lugares;
- pessoas confirmadas;
- convites pendentes;
- convites recusados;
- taxa de resposta.

Isso evita confundir “100 convites” com “100 convidados”.

### Membros da família

No cadastro/edição de um convite existe o campo **Membros deste convite**. Informe um nome por linha.

Exemplo:

```text
João Silva
Maria Silva
Pedro Silva
Ana Silva
```

O número de membros não pode ultrapassar o campo `lugares`.

Quando há membros cadastrados, o Nível 3 integrado troca o campo de quantidade por uma seleção individual. O RSVP registra tanto a quantidade quanto os nomes selecionados. Convites sem membros continuam funcionando normalmente apenas com quantidade.

### Importação Excel

Na tela **Convidados**, use **Importar Excel**.

O modelo fica em:

`admin/modelos/modelo-importacao-convidados.xlsx`

Colunas:

- `nome_exibido` — obrigatório;
- `responsavel` — opcional;
- `whatsapp` — opcional;
- `lugares` — obrigatório, de 1 a 50;
- `categoria` — opcional;
- `observacao` — opcional e interna;
- `membros` — opcional; separe os nomes por ponto e vírgula.

Exemplo de `membros`:

`João Silva; Maria Silva; Pedro Silva; Ana Silva`

A linha de exemplo é ignorada automaticamente. O painel valida o arquivo antes de importar e impede a importação quando encontra erros.

### Exportação Excel / CSV

A tela **Convidados** possui os botões **Exportar Excel** e **CSV**.

A exportação contém:

- convite/família;
- responsável;
- WhatsApp;
- lugares;
- membros cadastrados;
- categoria;
- status;
- total confirmado;
- nomes confirmados;
- restrição alimentar;
- mensagem;
- data/hora da resposta;
- token;
- link personalizado completo.

Isso permite enviar a lista atualizada para cerimonialista, buffet ou organização do evento.

### Regenerar token

Em cada linha existe **Novo token**.

Ao usar essa ação:

1. o sistema confirma a operação;
2. cria um token aleatório novo;
3. substitui o token anterior no banco;
4. o link antigo deixa de localizar o convite;
5. o novo link pode ser copiado/enviado normalmente.

Use quando um link for enviado para a pessoa errada ou compartilhado indevidamente.

## Login administrativo

A área administrativa é dividida em:

- `admin/login.html` — entrada com e-mail + senha;
- `admin/index.html` — painel protegido;
- `admin/reset-password.html` — definição de uma nova senha após recuperação.

Em produção (`mode: "supabase"`), o painel usa Supabase Auth. Não existe cadastro público na tela de login.

Cada casamento é gravado com `owner_id = usuário autenticado`, e as políticas RLS impedem um usuário de consultar ou alterar casamentos de outro proprietário.

## Teste rápido sem Supabase

`admin/js/config.js` vem com `mode: "demo"`.

Abra `admin/login.html` por um servidor local (Live Server, `python -m http.server`, etc.). No modo DEMO a tela oferece acesso ao painel sem uma senha fictícia.

Tokens de demonstração:

- `DEMO-FAMILIA-SILVA`
- `DEMO-MARIA-SOUZA`
- `DEMO-PEDRO-ANA`

O primeiro possui quatro membros cadastrados para testar a seleção individual no RSVP.

## Banco — instalação nova

1. Escolha/crie um projeto Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Em **Authentication > Users**, crie ou convide pelo menos um administrador.
4. Configure as Redirect URLs do Auth, incluindo `reset-password.html`.
5. Publique `supabase/functions/invite-public/index.ts` como Edge Function `invite-public`.
6. Em `admin/js/config.js`, mude para `mode: "supabase"` e informe `supabaseUrl` + `publishableKey`.
7. No convite integrado, mude `js/config.js > guestSystem.mode` para `"api"` e informe a URL da Edge Function.
8. Hospede painel e convite em HTTPS.

## Atualizando da v1.2

Se o schema da v1.2 já estiver instalado, **não é necessário recriar as tabelas existentes**. Execute:

`supabase/migration_v1_2_to_v1_3.sql`

Depois publique novamente a Edge Function `invite-public` da v1.3.

A migração adiciona a tabela `invitation_members` com RLS vinculado ao proprietário do casamento.

## Segurança

A `publishableKey` pode ficar no navegador quando combinada com autenticação e RLS. **Nunca coloque secret key ou `service_role` em `admin/js/config.js`, no convite ou em outro arquivo público.**

O token dos convites é gerado com `crypto.getRandomValues`. Na URL aparece apenas `?convite=TOKEN`; nome, lugares e membros são obtidos pelo sistema.
