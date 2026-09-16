/*
  ============================================================
  PAINEL DE CONVIDADOS — CONFIGURAÇÃO
  ============================================================

  MODO DEMO:
  - funciona sem banco de dados;
  - salva alterações no localStorage do navegador;
  - ideal para testar a interface.

  MODO SUPABASE:
  1. aplique supabase/schema.sql;
  2. publique a Edge Function invite-public;
  3. preencha supabaseUrl + publishableKey;
  4. troque mode para "supabase".

  NUNCA coloque secret key / service_role neste arquivo.
*/
window.GUEST_ADMIN_CONFIG = {
  mode: "demo", // "demo" ou "supabase"

  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  publishableKey: "SUA_CHAVE_PUBLICAVEL",

  // Usado como sugestão ao criar um casamento novo.
  defaultInviteBaseUrl: "../convites/nivel-3/index.html",

  // Importação e exportação de convidados por planilha.
  importTemplateUrl: "../modelos/modelo-importacao-convidados.xlsx",
  maxImportRows: 500,
  exportFilePrefix: "lista-convidados",

  // Autenticação administrativa.
  loginPage: "../index.html",
  passwordResetPage: "reset-password.html",

  // Apenas apresentação do painel.
  brandName: "Gestão de Convidados"
};
