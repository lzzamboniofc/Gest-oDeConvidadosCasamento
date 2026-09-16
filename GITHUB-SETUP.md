# Primeira publicação no GitHub

Depois de criar um repositório vazio no GitHub, abra o terminal **dentro desta pasta** e execute:

```bash
git init
git add .
git commit -m "v1.4 - estrutura GitHub Pages"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Depois, no GitHub:

1. **Settings → Pages**
2. **Build and deployment → Deploy from a branch**
3. Branch: `main`
4. Pasta: `/ (root)`
5. **Save**

## Próximas versões

Exemplo de fluxo simples:

```bash
git add .
git commit -m "v1.5 - descrição da alteração"
git push
```

Para marcar versões estáveis:

```bash
git tag v1.4
git push origin v1.4
```

## Antes de cada commit

```bash
git status
git diff
```

Confirme que não há senhas, `service_role`, secret keys, `.env` real ou outros segredos sendo enviados.
