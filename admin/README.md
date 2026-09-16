# Painel v1.5

O mesmo painel atende dois perfis:

- **Administrador:** todos os casamentos, criação de projetos e gestão de acessos;
- **Casal:** apenas casamento(s) vinculados, convidados, importação/exportação e RSVP.

A distinção de dados é feita no Supabase por RLS. O JavaScript apenas adapta a interface aos privilégios já determinados pelo banco.

No mobile, as tabelas principais são convertidas para cards automaticamente.
