# Sistema de Convidados + Convites de Casamento — v1.8

Estrutura preparada para versionamento no GitHub, publicação no **GitHub Pages** e uso com dois perfis de acesso: **Administrador** e **Casal**.

## O que mudou na v1.8

O convite Nível 3 agora possui **mini player de música sem autoplay**, com visual em vidro fosco, play/pause, disco giratório e equalizador discreto. O componente é maior no desktop e compacto no mobile. A trilha pode ser trocada em `convites/nivel-3/assets/audio/` e configurada em `convites/nivel-3/js/config.js`.

## O que mudou na v1.5

### Mobile sem rolagem lateral

As listas principais de convidados deixam de ser tabelas largas no celular. Abaixo de 760 px, cada linha vira um **card responsivo**, com rótulos, status e ações empilhadas. No desktop a visualização continua em tabela.

### Administrador x Casal

O login é o mesmo para todos. Após autenticar, o banco determina o que aquela conta pode acessar.

| Recurso | Administrador | Casal |
|---|:---:|:---:|
| Ver todos os casamentos | ✓ | — |
| Criar novos casamentos | ✓ | — |
| Selecionar entre vários casamentos | ✓ | apenas os vinculados |
| Gerenciar acessos dos casais | ✓ | — |
| Ver convidados | ✓ | ✓ |
| Adicionar/editar/excluir convidados | ✓ | ✓ |
| Importar Excel | ✓ | ✓ |
| Exportar Excel/CSV | ✓ | ✓ |
| Acompanhar RSVP | ✓ | ✓ |
| Editar dados do próprio casamento | ✓ | ✓ |

O controle real é feito por **RLS no Supabase**. Ocultar botões no navegador é apenas parte da interface; o banco também impede uma conta de casal de consultar outro casamento.

## Estrutura

```text
/
├── index.html                 # Login (entrada do GitHub Pages)
├── reset-password.html        # Recuperação / primeiro acesso
├── admin/
│   ├── index.html             # Painel único: admin ou casal
│   ├── css/
│   └── js/
├── convites/
│   ├── nivel-1/
│   ├── nivel-2/
│   ├── nivel-3/               # Integrado ao sistema de convidados
│   └── nivel-4/
├── modelos/
│   └── modelo-importacao-convidados.xlsx
├── supabase/
│   ├── schema.sql
│   ├── migration_v1_2_to_v1_3.sql
│   ├── migration_v1_4_to_v1_5.sql
│   ├── config.toml
│   └── functions/
│       ├── invite-public/
│       └── admin-access/
├── .gitignore
├── .nojekyll
└── CHANGELOG.md
```

## GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **o conteúdo desta pasta** para a raiz.
3. Abra **Settings → Pages**.
4. Escolha **Deploy from a branch**.
5. Branch `main`, pasta `/ (root)`.

Entrada/login:

```text
https://usuario.github.io/repositorio/
```

Painel:

```text
https://usuario.github.io/repositorio/admin/
```

Convite individual:

```text
https://usuario.github.io/repositorio/convites/nivel-3/?convite=TOKEN
```

## Testar sem Supabase

Em `admin/js/config.js`:

```js
mode: "demo"
```

Na tela inicial aparecem dois botões:

- **Abrir como administrador** — vê dois casamentos e a área `Acessos`;
- **Abrir como casal** — vê somente o casamento vinculado ao casal de demonstração.

Também é possível abrir diretamente:

```text
/admin/?perfil=casal
```

## Produção com Supabase

Em `admin/js/config.js`:

```js
mode: "supabase"
supabaseUrl: "https://SEU-PROJETO.supabase.co"
publishableKey: "SUA_CHAVE_PUBLICAVEL"
```

Nunca coloque secret key, `service_role`, senha de banco ou outro segredo no GitHub Pages.

### Projeto novo

Aplique:

```text
supabase/schema.sql
```

### Atualizando a v1.4

Aplique:

```text
supabase/migration_v1_4_to_v1_5.sql
```

Depois crie/promova o primeiro administrador em `public.profiles`. O próprio SQL contém um exemplo usando o UUID da conta criada em **Authentication → Users**.

### Edge Functions

Publique:

- `invite-public` — consulta do convite e RSVP público;
- `admin-access` — convite/vínculo do casal, somente para administrador autenticado.

`supabase/config.toml` deixa `invite-public` público e mantém `admin-access` exigindo autenticação.

Na função `admin-access`, a chave privilegiada existe somente no ambiente do Supabase. O frontend chama a função usando a sessão do administrador.

### URLs permitidas no Auth

Cadastre no Supabase as URLs usadas no primeiro acesso e recuperação de senha. Exemplo:

```text
https://usuario.github.io/repositorio/reset-password.html
https://usuario.github.io/repositorio/reset-password.html?convite_acesso=1
```

## Fluxo para dar acesso ao casal

1. Administrador entra no painel.
2. Seleciona/cria o casamento.
3. Abre **Acessos**.
4. Informa nome e e-mail do casal.
5. O sistema cria/vincula a conta e envia o convite de acesso quando for uma nova conta.
6. O casal define a senha.
7. Ao entrar, o casal recebe do banco somente o casamento ao qual foi vinculado.

Se a mesma conta for vinculada a mais de um casamento, o seletor exibirá apenas esses casamentos.

## Planilha

O modelo oficial continua em:

```text
modelos/modelo-importacao-convidados.xlsx
```

## Segurança no Git

O `.gitignore` bloqueia `.env`, chaves privadas, arquivos temporários, configurações de IDE e diretórios locais do Supabase. Revise `git status` e `git diff` antes de cada commit.


### Atualização v1.7
Depois de enviar uma confirmação, o convite exibe um modal de sucesso e bloqueia novos envios. A Edge Function `invite-public` também rejeita uma segunda resposta para o mesmo token. O painel ganhou o botão **Atualizar** para buscar imediatamente novos RSVPs. Para aplicar esta versão em um projeto já publicado, substitua os arquivos do frontend e faça novo deploy da Edge Function `invite-public`. Não há alteração de schema do banco nesta versão.
