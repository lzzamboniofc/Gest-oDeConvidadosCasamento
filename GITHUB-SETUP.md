# Publicar / atualizar no GitHub

## Novo repositório

Abra o terminal dentro desta pasta:

```bash
git init
git add .
git commit -m "v1.5 - painel responsivo e perfis admin/casal"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Depois habilite:

1. **Settings → Pages**
2. **Deploy from a branch**
3. branch `main`
4. pasta `/ (root)`

## Se o repositório já contém a v1.4

Substitua/atualize os arquivos com esta versão e faça:

```bash
git status
git diff
git add .
git commit -m "v1.5 - responsivo e acesso dos casais"
git push
```

Tag opcional:

```bash
git tag v1.5
git push origin v1.5
```

## Importante para o banco

Atualizar os arquivos do GitHub **não altera automaticamente o Supabase**. Se você já instalou a v1.4 no banco, aplique também:

```text
supabase/migration_v1_4_to_v1_5.sql
```

E publique a nova Edge Function:

```text
supabase/functions/admin-access/
```

## Antes do commit

```bash
git status
git diff
```

Nunca envie secret key, `service_role`, senha de banco ou `.env` real para o GitHub.
