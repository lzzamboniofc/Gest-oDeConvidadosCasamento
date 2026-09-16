# Edge Function `admin-access`

Função autenticada usada exclusivamente pelo painel administrativo para convidar/vincular contas de casal a um casamento.

## Segurança

- o navegador envia a sessão do administrador pelo `Authorization`;
- a função valida a sessão no Supabase Auth;
- o perfil do chamador precisa ter `role = 'admin'` em `public.profiles`;
- a chave secreta fica somente no ambiente da Edge Function;
- nunca coloque `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` no GitHub Pages.

## Variáveis

A função aceita as variáveis fornecidas pelo ambiente Supabase e tenta, nesta ordem:

- `SUPABASE_PUBLISHABLE_KEY` ou `SUPABASE_ANON_KEY`;
- `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`.

Opcionalmente configure `ADMIN_ALLOWED_ORIGINS` com o domínio do GitHub Pages/domínio próprio. Separe múltiplas origens por vírgula.

O `redirectTo` usado no convite precisa estar cadastrado em **Authentication > URL Configuration > Redirect URLs**.
