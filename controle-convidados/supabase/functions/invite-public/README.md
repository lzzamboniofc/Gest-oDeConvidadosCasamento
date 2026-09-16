# Edge Function `invite-public`

Esta função é pública de propósito: o convidado não possui conta no Supabase. O **token forte do convite** funciona como credencial daquele convite e a função só devolve dados sanitizados.

Na publicação da função, desative a validação JWT da plataforma (`verify_jwt = false`) porque a autenticação é feita pelo token do convite dentro da própria função.

Opcionalmente configure o secret:

`INVITE_ALLOWED_ORIGINS=https://seuconvite.com,https://www.seuconvite.com`

Se não configurar, a função aceita CORS de qualquer origem (`*`). Para produção, prefira restringir aos domínios dos convites.
