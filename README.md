# Sistema de Convidados + Convites de Casamento

Estrutura organizada para versionamento no GitHub e publicação pelo **GitHub Pages**.

## Estrutura

```text
/
├── index.html                 # Login administrativo (entrada do GitHub Pages)
├── reset-password.html        # Recuperação de senha
├── admin/                     # Painel de gestão
│   ├── index.html
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
│   └── functions/invite-public/
├── .gitignore
├── .nojekyll
└── CHANGELOG.md
```

## GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **o conteúdo desta pasta** para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em *Build and deployment*, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`.
6. Salve.

A URL principal do Pages abrirá `index.html`, portanto mostrará diretamente a tela de login.

Exemplo:

```text
https://usuario.github.io/nome-do-repositorio/
```

Painel:

```text
https://usuario.github.io/nome-do-repositorio/admin/
```

Convite Nível 3:

```text
https://usuario.github.io/nome-do-repositorio/convites/nivel-3/
```

Convite individual:

```text
https://usuario.github.io/nome-do-repositorio/convites/nivel-3/?convite=SEU_TOKEN
```

## Configuração do painel

Edite:

```text
admin/js/config.js
```

Para testar sem banco:

```js
mode: "demo"
```

Para produção com Supabase:

```js
mode: "supabase"
supabaseUrl: "https://SEU-PROJETO.supabase.co"
publishableKey: "SUA_CHAVE_PUBLICAVEL"
```

A `publishableKey` é destinada ao cliente público. **Nunca coloque `service_role`, secret key, senha do banco ou outros segredos no repositório/front-end.**

## Configuração do convite Nível 3

O conteúdo do casamento continua em:

```text
convites/nivel-3/js/config.js
```

A integração com o sistema de convidados também é configurada nesse arquivo, em `guestSystem`.

## Planilha

O modelo oficial fica em:

```text
modelos/modelo-importacao-convidados.xlsx
```

O painel já aponta para esse caminho.

## Supabase

Os arquivos de banco e Edge Function ficam em `supabase/`. Antes de colocar em produção, aplique o schema, publique a função `invite-public` e configure autenticação/RLS conforme a documentação do projeto.

## Segurança no Git

O `.gitignore` bloqueia `.env`, chaves privadas, arquivos temporários, configurações de IDE e diretórios locais do Supabase. Mesmo assim, revise sempre um `git diff` ou `git status` antes de fazer commit.
