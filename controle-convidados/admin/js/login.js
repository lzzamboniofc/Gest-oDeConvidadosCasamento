import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

const CONFIG = window.GUEST_ADMIN_CONFIG || {};
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const isConfigured = () => CONFIG.supabaseUrl && CONFIG.publishableKey && !CONFIG.supabaseUrl.includes("SEU-PROJETO");

function client() {
  if (!isConfigured()) throw new Error("Configure supabaseUrl e publishableKey em js/config.js antes de usar o login.");
  return createClient(CONFIG.supabaseUrl, CONFIG.publishableKey);
}

function friendlyError(error) {
  const text = String(error?.message || "").toLowerCase();
  if (text.includes("invalid login credentials")) return "E-mail ou senha inválidos.";
  if (text.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (text.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  return error?.message || "Não foi possível concluir a operação.";
}

function setBusy(button, busy, label) {
  if (!button) return;
  button.disabled = busy;
  if (label) button.textContent = label;
}

function showBox(name) {
  $("#loginBox").hidden = name !== "login";
  $("#forgotBox").hidden = name !== "forgot";
}

function bindPasswordToggles() {
  $$('[data-toggle-password]').forEach(button => button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Mostrar" : "Ocultar";
    button.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
  }));
}

async function start() {
  bindPasswordToggles();

  const params = new URLSearchParams(location.search);
  if (params.get("senha") === "alterada") {
    $("#loginNotice").textContent = "Senha alterada com sucesso. Entre com sua nova senha.";
    $("#loginNotice").hidden = false;
  }

  if (CONFIG.mode === "demo") {
    $("#demoAccess").hidden = false;
    $("#loginForm").hidden = true;
    $("#demoButton").addEventListener("click", () => location.href = "index.html");
    return;
  }

  const supabase = client();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    location.replace("index.html");
    return;
  }

  $("#forgotButton").addEventListener("click", () => {
    $("#forgotStatus").textContent = "";
    const currentEmail = $("#loginForm").elements.email.value;
    if (currentEmail) $("#forgotForm").elements.email.value = currentEmail;
    showBox("forgot");
  });
  $("#backToLogin").addEventListener("click", () => showBox("login"));

  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = $("#loginButton");
    const status = $("#loginStatus");
    status.textContent = "";
    try {
      setBusy(button, true, "Entrando...");
      const { error } = await supabase.auth.signInWithPassword({
        email: form.elements.email.value.trim(),
        password: form.elements.password.value
      });
      if (error) throw error;
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Não foi possível validar a sessão.");
      location.replace("index.html");
    } catch (error) {
      status.textContent = friendlyError(error);
      setBusy(button, false, "Entrar no painel");
    }
  });

  $("#forgotForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = $("#forgotSubmit");
    const status = $("#forgotStatus");
    status.textContent = "";
    try {
      setBusy(button, true, "Enviando...");
      const resetUrl = new URL(CONFIG.passwordResetPage || "reset-password.html", location.href).href;
      const { error } = await supabase.auth.resetPasswordForEmail(form.elements.email.value.trim(), { redirectTo: resetUrl });
      if (error) throw error;
      status.classList.add("form-status--success");
      status.textContent = "Se este e-mail estiver cadastrado, o link de recuperação será enviado.";
      setBusy(button, false, "Enviar novamente");
    } catch (error) {
      status.classList.remove("form-status--success");
      status.textContent = friendlyError(error);
      setBusy(button, false, "Enviar link de recuperação");
    }
  });
}

start().catch(error => {
  console.error(error);
  $("#loginStatus").textContent = friendlyError(error);
});
