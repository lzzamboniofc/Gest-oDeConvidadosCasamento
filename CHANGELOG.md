# Changelog

## v1.5 — painel responsivo + Administrador/Casal

- lista de convidados responsiva em formato de cards no mobile, sem rolagem horizontal;
- dashboard recente também vira cards no celular;
- perfil **Administrador** com acesso a todos os casamentos;
- perfil **Casal** limitado aos casamentos vinculados;
- área **Acessos** exclusiva do administrador;
- administrador pode convidar uma conta de casal por e-mail;
- primeiro acesso do casal usa a tela de criação de senha;
- nova tabela `profiles` para papel global da conta;
- nova tabela `wedding_members` para vincular usuários aos casamentos;
- novas políticas RLS por casamento;
- nova Edge Function `admin-access` para ações privilegiadas sem expor chave secreta;
- `migration_v1_4_to_v1_5.sql` incluída;
- modo DEMO permite testar separadamente administrador e casal;
- compatibilidade do modo DEMO com os RSVPs do convite preservada.

## v1.4 — GitHub Pages / organização do repositório

- `index.html` na raiz como login;
- painel em `admin/`;
- convites organizados em `convites/nivel-1` a `nivel-4`;
- caminhos ajustados para GitHub Pages;
- `.gitignore` e `.nojekyll`.

## v1.3

- membros individuais por convite/família;
- exportação Excel/CSV;
- regeneração de token;
- métricas administrativas ampliadas.

## v1.2

- Supabase Auth;
- login administrativo;
- recuperação de senha;
- proteção da área administrativa.

## v1.1

- importação de convidados por Excel.

## v1.0

- painel inicial de gestão de convidados.


## v1.6 — Ajustes do convite
- Destaque maior para o nome do convidado na abertura e no hero.
- Remoção do campo de restrição alimentar do RSVP e da estrutura de dados associada.
- Cards “Onde & quando” com divisão visual entre fundo sólido e imagem do local.
- Seção de roteiro com troca de imagem de fundo ao passar o mouse sobre cada item.
- Suporte a imagens responsivas por seção usando objetos desktop/mobile no config.js.


## v1.7 — RSVP e atualização do painel
- Modal claro após o envio do RSVP, com opção de recarregar o convite.
- Bloqueio do formulário depois da primeira resposta e proteção contra segunda confirmação também na Edge Function.
- Remoção do botão “Compartilhar convite”.
- Botão “Atualizar” no painel administrativo para buscar RSVP e demais dados novamente.
- Correção de caminhos de imagens dinâmicas no GitHub Pages usando URLs absolutas resolvidas a partir do documento.
