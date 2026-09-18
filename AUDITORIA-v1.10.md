# Auditoria técnica — v1.10

## Escopo revisado

- raiz / GitHub Pages;
- login e recuperação de senha;
- painel Administrador e Casal;
- responsividade das tabelas;
- importação e exportação Excel/CSV;
- convite Nível 3 integrado;
- RSVP, mensagens e confirmação única;
- mini player de música;
- imagens responsivas desktop/mobile;
- convites Níveis 1, 2 e 4;
- schema, RLS e Edge Functions do Supabase;
- referências locais de imagens, scripts e estilos.

## Correções aplicadas

### 1. RLS do perfil Casal

A política de `public.weddings` usava `wm.wedding_id = id` dentro de uma subquery. No PostgreSQL, esse `id` era associado à tabela interna `wedding_members`, resultando efetivamente em `wm.wedding_id = wm.id`.

Foi corrigido para `wm.wedding_id = weddings.id` no schema e foi criada `supabase/migration_v1_9_to_v1_10.sql` para bancos já existentes.

### 2. RSVP realmente único

A Edge Function verificava a existência do RSVP e depois usava `upsert`. Duas requisições simultâneas ainda poderiam atualizar o mesmo RSVP. Agora a gravação usa `insert` e a constraint `unique(invitation_id)` é a garantia final. Uma segunda tentativa recebe conflito 409.

### 3. Imagens desktop/mobile

O Nível 3 já suportava duas imagens em hero/abertura, história, locais, roteiro e RSVP. A v1.10 também padroniza galeria e dress code.

O breakpoint é 768 px. Os arquivos atuais de exemplo usam a mesma foto em `desktop` e `mobile`; para realmente mudar a composição, substitua apenas o caminho `mobile` pelo arquivo vertical correspondente.

Referência recomendada para grandes fundos com `cover`:
- desktop: ~1920 x 1080;
- mobile: ~1080 x 1920.

### 4. Mudança de viewport/orientação

O roteiro recalcula a imagem correta quando a janela muda de tamanho/orientação. A galeria também atualiza a origem desktop/mobile.

### 5. Documentação

O README do Nível 3 estava desatualizado e ainda dizia que não havia backend, música e painel. Foi reescrito para refletir o produto atual.

## Verificações concluídas

- todos os arquivos JavaScript passaram em `node --check`;
- HTML sem IDs duplicados;
- rotas principais responderam HTTP 200 em servidor local;
- modelo Excel importado e validado com as abas `Convidados` e `Instruções`;
- nenhuma referência local quebrada foi encontrada, exceto a fonte comercial opcional `new-icon-script.woff2` do Nível 4, cuja ausência é intencional e documentada;
- RLS está ativado em todas as tabelas públicas do projeto Supabase;
- `invite-public` está pública (`verify_jwt=false`) e `admin-access` exige JWT (`verify_jwt=true`).

## Recomendações antes de produção

- aplicar `migration_v1_9_to_v1_10.sql` no Supabase atual;
- republicar a Edge Function `invite-public`;
- habilitar Leaked Password Protection no Supabase Auth quando o sistema entrar em produção;
- configurar SMTP próprio quando houver domínio;
- substituir as fotos de exemplo por versões desktop/mobile reais;
- configurar `ADMIN_ALLOWED_ORIGINS` e `INVITE_ALLOWED_ORIGINS` com o domínio final, evitando `*` em produção.

## Observação do Nível 4

`css/theme.css` referencia `assets/fonts/new-icon-script.woff2`, uma webfont comercial opcional que não acompanha o pacote. O preset padrão não usa essa fonte. Se o preset `newIcon` for escolhido sem o arquivo licenciado, haverá tentativa de carregamento com fallback para outra fonte.
