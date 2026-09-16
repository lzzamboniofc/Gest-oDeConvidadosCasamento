# Changelog

## v1.4 — GitHub Pages / organização do repositório

- `index.html` movido para a raiz e usado como login administrativo.
- painel movido para `admin/`.
- recuperação de senha disponível em `/reset-password.html`.
- convites organizados em `convites/nivel-1` a `convites/nivel-4`.
- Nível 3 mantém integração com o sistema de convidados.
- arquivos Supabase centralizados em `supabase/`.
- modelo Excel centralizado em `modelos/`.
- caminhos relativos ajustados para funcionar em GitHub Pages de projeto (`usuario.github.io/repositorio/`).
- adicionado `.gitignore`.
- adicionado `.nojekyll`.
- adicionados redirects de compatibilidade em `admin/login.html` e `admin/reset-password.html`.

## v1.3

- membros individuais por convite/família.
- exportação Excel/CSV.
- regeneração de token.
- métricas administrativas ampliadas.

## v1.2

- Supabase Auth.
- login administrativo.
- recuperação de senha.
- proteção da área administrativa.

## v1.1

- importação de convidados por Excel.

## v1.0

- painel inicial de gestão de convidados.

### Ajuste GitHub Pages

- geração de links personalizados agora resolve caminhos relativos contra a URL atual, produzindo URL HTTPS completa também nas exportações Excel/CSV.
