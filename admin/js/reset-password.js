import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

const CONFIG = window.GUEST_ADMIN_CONFIG || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function friendlyError(error) {
  const text = String(error?.message || "").toLowerCase();
  if (text.includes("same password")) return "Escolha uma senha diferente da atual.";
  if (text.includes("expired") || text.includes("invalid")) return "Este link é inválido ou expirou. Solicite uma nova recuperação de senha.";
  return error?.message || "Não foi possível alterar a senha.";
}

function bindPasswordToggles() {
  $$('[data-toggle-password]').forEach(button => button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Mostrar" : "Ocultar";
  }));
}

async function start() {
  bindPasswordToggles();
  if (CONFIG.mode === "demo") {
    $("#resetForm").hidden = true;
    $("#resetIntro").textContent = "Recuperação de senha está disponível quando o painel estiver conectado ao Supabase.";
    return;
  }
  if (!CONFIG.supabaseUrl || !CONFIG.publishableKey || CONFIG.supabaseUrl.includes("SEU-PROJETO")) throw new Error("Supabase não configurado.");

  const supabase = createClient(CONFIG.supabaseUrl, CONFIG.publishableKey);
  let recoveryDetected = false;
  const { data: listener } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") recoveryDetected = true;
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    $("#resetForm").hidden = true;
    $("#resetIntro").textContent = "Este link de recuperação não é válido ou já expirou. Volte ao login e solicite um novo link.";
    listener.subscription.unsubscribe();
    return;
  }

  $("#resetForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.elements.password.value;
    const confirmation = form.elements.confirm_password.value;
    const status = $("#resetStatus");
    const button = $("#resetButton");
    status.textContent = "";
    if (password.length < 8) { status.textContent = "Use pelo menos 8 caracteres."; return; }
    if (password !== confirmation) { status.textContent = "As duas senhas não são iguais."; return; }
    try {
      button.disabled = true;
      button.textContent = "Salvando...";
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut({ scope: "local" });
      location.replace("index.html?senha=alterada");
    } catch (error) {
      status.textContent = friendlyError(error);
      button.disabled = false;
      button.textContent = "Salvar nova senha";
    }
  });
}

start().catch(error => {
  console.error(error);
  $("#resetStatus").textContent = friendlyError(error);
});
