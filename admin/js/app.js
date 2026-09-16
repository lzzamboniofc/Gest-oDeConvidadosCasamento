import { createClient } from "https://esm.sh/@supabase/supabase-js@2.116.0";

const CONFIG = window.GUEST_ADMIN_CONFIG || {};
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const state = { weddings: [], invitations: [], weddingId: null, editId: null, user: null, importRows: [] };
const DEMO_KEY = "wedding_guest_manager_demo_v1";

const sample = {
  weddings: [{ id: "demo-wedding", name: "Liliane & Igor", slug: "liliane-igor", event_date: "2027-04-03", invite_base_url: "../convites/nivel-3/index.html" }],
  invitations: [
    { id: "i1", wedding_id: "demo-wedding", token: "DEMO-FAMILIA-SILVA", display_name: "Família Silva", contact_name: "João Silva", phone: "5515991111111", seats: 4, category: "Família", notes: "", active: true, members: ["João Silva","Maria Silva","Pedro Silva","Ana Silva"], rsvps: [] },
    { id: "i2", wedding_id: "demo-wedding", token: "DEMO-MARIA-SOUZA", display_name: "Maria Souza", contact_name: "Maria Souza", phone: "5515992222222", seats: 1, category: "Amigos", notes: "", active: true, members: ["Maria Souza"], rsvps: [{ attending: true, guest_count: 1, submitted_name: "Maria Souza", guest_names:["Maria Souza"], meal_notes: "", message: "", responded_at: new Date().toISOString(), updated_at: new Date().toISOString() }] },
    { id: "i3", wedding_id: "demo-wedding", token: "DEMO-PEDRO-ANA", display_name: "Pedro & Ana", contact_name: "Pedro Costa", phone: "5515993333333", seats: 2, category: "Amigos", notes: "", active: true, members: ["Pedro Costa","Ana Costa"], rsvps: [{ attending: false, guest_count: 0, submitted_name: "Pedro Costa", guest_names:[], meal_notes: "", message: "", responded_at: new Date().toISOString(), updated_at: new Date().toISOString() }] }
  ]
};

const clone = value => JSON.parse(JSON.stringify(value));
const loadDemo = () => { try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || clone(sample); } catch { return clone(sample); } };
const saveDemo = data => localStorage.setItem(DEMO_KEY, JSON.stringify(data));
const generateToken = (bytes = 24) => {
  const arr = new Uint8Array(bytes); crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};
const slugify = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const normalizeBase = base => String(base || "").trim();
const buildLink = (invite, wedding) => {
  const base = normalizeBase(wedding?.invite_base_url || CONFIG.defaultInviteBaseUrl || "");
  if (!base) return `?convite=${encodeURIComponent(invite.token)}`;
  try {
    const url = new URL(base, location.href);
    url.searchParams.set("convite", invite.token);
    return url.href;
  } catch {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}convite=${encodeURIComponent(invite.token)}`;
  }
};
const rsvpOf = inv => Array.isArray(inv.rsvps) ? inv.rsvps[0] : inv.rsvps || null;
const statusOf = inv => { const r = rsvpOf(inv); return !r ? "pending" : r.attending ? "confirmed" : "declined"; };
const statusLabel = s => ({ pending: "Pendente", confirmed: "Confirmado", declined: "Não irá" }[s]);
const escapeHtml = value => String(value ?? "").replace(/[&<>\"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const toast = text => { const el = $("#toast"); el.textContent = text; el.classList.add("is-visible"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("is-visible"), 2600); };
const parseMembersValue = value => [...new Set(String(value ?? "").split(/[\n;|]+/).map(v => v.trim()).filter(Boolean))].slice(0, 50);
const membersOf = inv => {
  if (Array.isArray(inv?.members)) return inv.members.map(v => typeof v === "string" ? v : v?.name).filter(Boolean);
  if (Array.isArray(inv?.invitation_members)) return [...inv.invitation_members].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map(v=>v.name).filter(Boolean);
  return [];
};
const formatDateTime = value => {
  if (!value) return "";
  try { return new Intl.DateTimeFormat("pt-BR", { dateStyle:"short", timeStyle:"short" }).format(new Date(value)); } catch { return String(value); }
};

const IMPORT_ALIASES = {
  nome_exibido: "display_name", nome: "display_name", convidado: "display_name", familia: "display_name", display_name: "display_name",
  responsavel: "contact_name", contato: "contact_name", contact_name: "contact_name",
  whatsapp: "phone", telefone: "phone", celular: "phone", phone: "phone",
  lugares: "seats", numero_de_lugares: "seats", quantidade: "seats", seats: "seats",
  membros: "members", integrantes: "members", pessoas: "members", members: "members",
  categoria: "category", category: "category",
  observacao: "notes", observacoes: "notes", notes: "notes"
};
const normalizeHeader = value => String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const maxImportRows = () => Math.max(1, Number(CONFIG.maxImportRows || 500));

async function parseGuestWorkbook(file) {
  if (!window.XLSX) throw new Error("Leitor de Excel não carregado. Verifique sua conexão e tente novamente.");
  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
  const preferred = workbook.SheetNames.find(name => normalizeHeader(name) === "convidados");
  const sheetName = preferred || workbook.SheetNames[0];
  if (!sheetName) throw new Error("A planilha não possui nenhuma aba legível.");
  const matrix = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", raw: false });
  const headerIndex = matrix.findIndex(row => row.some(cell => String(cell ?? "").trim()));
  if (headerIndex < 0) throw new Error("A planilha está vazia.");

  const headerMap = {};
  matrix[headerIndex].forEach((cell, index) => { const key = IMPORT_ALIASES[normalizeHeader(cell)]; if (key && headerMap[key] == null) headerMap[key] = index; });
  if (headerMap.display_name == null || headerMap.seats == null) throw new Error("Cabeçalho inválido. Use o modelo e mantenha pelo menos as colunas nome_exibido e lugares.");

  const valid = []; const errors = []; let ignored = 0; let considered = 0;
  for (let i = headerIndex + 1; i < matrix.length; i++) {
    const row = matrix[i];
    if (!row || !row.some(cell => String(cell ?? "").trim())) continue;
    const get = key => headerMap[key] == null ? "" : String(row[headerMap[key]] ?? "").trim();
    const displayName = get("display_name");
    if (/^exemplo\b/i.test(displayName)) { ignored++; continue; }
    considered++;
    if (considered > maxImportRows()) { errors.push(`Limite excedido: o máximo é ${maxImportRows()} convidados por importação.`); break; }

    const rowNumber = i + 1;
    const seatsText = get("seats").replace(",", ".");
    const seats = Number(seatsText);
    const phoneRaw = get("phone");
    const phone = phoneRaw.replace(/\D/g, "");
    const members = parseMembersValue(get("members"));
    const rowErrors = [];
    if (!displayName) rowErrors.push("nome_exibido é obrigatório");
    if (!Number.isInteger(seats) || seats < 1 || seats > 50) rowErrors.push("lugares deve ser um número inteiro entre 1 e 50");
    if (members.length > seats) rowErrors.push(`há ${members.length} membros, mas o convite possui apenas ${seats} lugares`);
    if (phoneRaw && /e[+-]?\d+/i.test(phoneRaw)) rowErrors.push("WhatsApp está em notação científica; use a coluna do modelo, que já está formatada como texto");
    else if (phoneRaw && (phone.length < 10 || phone.length > 15)) rowErrors.push("WhatsApp deve ter entre 10 e 15 dígitos");
    if (rowErrors.length) { errors.push(`Linha ${rowNumber}: ${rowErrors.join("; ")}.`); continue; }

    valid.push({
      display_name: displayName,
      contact_name: get("contact_name"),
      phone,
      seats,
      members,
      category: get("category"),
      notes: get("notes")
    });
  }
  return { valid, errors, ignored, sheetName };
}

let supabase = null;
if (CONFIG.mode === "supabase") {
  if (!CONFIG.supabaseUrl || !CONFIG.publishableKey || CONFIG.supabaseUrl.includes("SEU-PROJETO")) throw new Error("Preencha supabaseUrl e publishableKey em js/config.js");
  supabase = createClient(CONFIG.supabaseUrl, CONFIG.publishableKey);
}

async function syncSupabaseMembers(invitationId, members) {
  const { error: deleteError } = await supabase.from("invitation_members").delete().eq("invitation_id", invitationId);
  if (deleteError) throw deleteError;
  if (!members.length) return;
  const payload = members.map((name, index) => ({ invitation_id: invitationId, name, sort_order: index }));
  const { error } = await supabase.from("invitation_members").insert(payload);
  if (error) throw error;
}

const backend = {
  async currentUser() {
    if (CONFIG.mode === "demo") return { id: "demo-user", email: "demo@local" };
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  },
  async logout() { if (CONFIG.mode === "supabase") await supabase.auth.signOut({ scope: "local" }); },
  async weddings() {
    if (CONFIG.mode === "demo") return loadDemo().weddings;
    const { data, error } = await supabase.from("weddings").select("*").order("created_at"); if (error) throw error; return data;
  },
  async saveWedding(item) {
    if (CONFIG.mode === "demo") {
      const d = loadDemo(); const i = d.weddings.findIndex(w => w.id === item.id);
      if (i >= 0) d.weddings[i] = { ...d.weddings[i], ...item }; else d.weddings.push({ ...item, id: crypto.randomUUID() });
      saveDemo(d); return;
    }
    if (item.id) {
      const { error } = await supabase.from("weddings").update({ name:item.name, slug:item.slug, event_date:item.event_date || null, invite_base_url:item.invite_base_url }).eq("id", item.id); if (error) throw error;
    } else {
      const { error } = await supabase.from("weddings").insert({ name:item.name, slug:item.slug, event_date:item.event_date || null, invite_base_url:item.invite_base_url, owner_id: state.user.id }); if (error) throw error;
    }
  },
  async invitations(weddingId) {
    if (CONFIG.mode === "demo") return loadDemo().invitations.filter(i => i.wedding_id === weddingId);
    const { data, error } = await supabase.from("invitations").select("*, rsvps(*), invitation_members(*)").eq("wedding_id", weddingId).order("created_at", { ascending:false });
    if (error) throw error; return data;
  },
  async saveInvitation(item) {
    const members = Array.isArray(item.members) ? item.members : parseMembersValue(item.members);
    if (members.length > Number(item.seats)) throw new Error("A quantidade de membros não pode ultrapassar o número de lugares.");
    if (CONFIG.mode === "demo") {
      const d = loadDemo(); const i = d.invitations.findIndex(x => x.id === item.id);
      if (i >= 0) d.invitations[i] = { ...d.invitations[i], ...item, seats:Number(item.seats), members };
      else d.invitations.unshift({ ...item, id:crypto.randomUUID(), wedding_id:state.weddingId, token:generateToken(), active:true, seats:Number(item.seats), members, rsvps:[] });
      saveDemo(d); return;
    }
    const payload = { wedding_id:state.weddingId, display_name:item.display_name, contact_name:item.contact_name || null, phone:item.phone || null, seats:Number(item.seats), category:item.category || null, notes:item.notes || null };
    let invitationId = item.id;
    if (item.id) {
      const { error } = await supabase.from("invitations").update(payload).eq("id", item.id); if (error) throw error;
    } else {
      payload.token = generateToken();
      const { data, error } = await supabase.from("invitations").insert(payload).select("id").single(); if (error) throw error; invitationId = data.id;
    }
    await syncSupabaseMembers(invitationId, members);
  },
  async deleteInvitation(id) {
    if (CONFIG.mode === "demo") { const d = loadDemo(); d.invitations = d.invitations.filter(i => i.id !== id); saveDemo(d); return; }
    const { error } = await supabase.from("invitations").delete().eq("id", id); if (error) throw error;
  },
  async regenerateToken(id) {
    const token = generateToken();
    if (CONFIG.mode === "demo") { const d=loadDemo(); const inv=d.invitations.find(i=>i.id===id); if(!inv) throw new Error("Convite não encontrado."); inv.token=token; saveDemo(d); return token; }
    const { error } = await supabase.from("invitations").update({ token }).eq("id", id); if (error) throw error; return token;
  },
  async importInvitations(rows) {
    if (!rows.length) return;
    if (CONFIG.mode === "demo") {
      const d = loadDemo();
      const added = rows.map(item => ({ ...item, id: crypto.randomUUID(), wedding_id: state.weddingId, token: generateToken(), active: true, seats:Number(item.seats), members:item.members || [], rsvps: [] }));
      d.invitations = [...added.reverse(), ...d.invitations]; saveDemo(d); return;
    }
    const prepared = rows.map(item => ({ item, token:generateToken() }));
    const payload = prepared.map(({item,token}) => ({ wedding_id: state.weddingId, token, display_name: item.display_name, contact_name: item.contact_name || null, phone: item.phone || null, seats: Number(item.seats), category: item.category || null, notes: item.notes || null }));
    const { data, error } = await supabase.from("invitations").insert(payload).select("id,token"); if (error) throw error;
    const idByToken = new Map((data || []).map(row => [row.token,row.id]));
    const membersPayload = [];
    prepared.forEach(({item,token}) => (item.members || []).forEach((name,index) => membersPayload.push({ invitation_id:idByToken.get(token), name, sort_order:index })));
    if (membersPayload.length) { const { error:memberError } = await supabase.from("invitation_members").insert(membersPayload); if (memberError) throw memberError; }
  }
};

function showView(name) {
  $$(".view").forEach(v => v.classList.toggle("is-active", v.id === `view-${name}`));
  $$(".nav-item").forEach(v => v.classList.toggle("is-active", v.dataset.view === name));
  $(".sidebar")?.classList.remove("is-open");
}

async function refreshAll(preferredId = state.weddingId) {
  state.weddings = await backend.weddings();
  state.weddingId = state.weddings.some(w => w.id === preferredId) ? preferredId : state.weddings[0]?.id || null;
  renderWeddingSelect();
  if (state.weddingId) state.invitations = await backend.invitations(state.weddingId); else state.invitations = [];
  renderAll();
}

function currentWedding() { return state.weddings.find(w => w.id === state.weddingId); }
function renderWeddingSelect() {
  const el = $("#weddingSelect"); el.innerHTML = state.weddings.map(w => `<option value="${w.id}">${escapeHtml(w.name)}</option>`).join("");
  if (state.weddingId) el.value = state.weddingId;
}
function renderStats() {
  const invites = state.invitations;
  const responded = invites.filter(i => statusOf(i) !== "pending").length;
  $("#dashboardTitle").textContent = currentWedding()?.name || "Convidados";
  $("#statInvites").textContent = invites.length;
  $("#statSeats").textContent = invites.reduce((n, i) => n + Number(i.seats || 0), 0);
  $("#statConfirmed").textContent = invites.reduce((n,i) => n + (statusOf(i) === "confirmed" ? Number(rsvpOf(i)?.guest_count || 0) : 0), 0);
  $("#statPending").textContent = invites.filter(i => statusOf(i) === "pending").length;
  $("#statDeclined").textContent = invites.filter(i => statusOf(i) === "declined").length;
  $("#statResponseRate").textContent = invites.length ? `${Math.round((responded / invites.length) * 100)}%` : "0%";
}
function rowHtml(inv, compact=false) {
  const status = statusOf(inv); const r = rsvpOf(inv); const confirmed = status === "confirmed" ? r?.guest_count ?? 0 : "—";
  const memberCount = membersOf(inv).length;
  const memberMeta = memberCount ? `${memberCount} membro${memberCount === 1 ? "" : "s"}` : "sem membros individuais";
  if (compact) return `<tr><td class="guest-name"><strong>${escapeHtml(inv.display_name)}</strong><small>${escapeHtml(inv.category || "Sem categoria")} · ${escapeHtml(memberMeta)}</small></td><td>${inv.seats}</td><td>${confirmed}</td><td><span class="status status--${status}">${statusLabel(status)}</span></td><td><button class="mini-btn" data-copy="${inv.id}">Copiar link</button></td></tr>`;
  return `<tr><td class="guest-name"><strong>${escapeHtml(inv.display_name)}</strong><small>${escapeHtml(inv.category || "Sem categoria")} · ${escapeHtml(memberMeta)}</small></td><td><span>${escapeHtml(inv.contact_name || "—")}</span><br><small class="muted">${escapeHtml(inv.phone || "")}</small></td><td>${inv.seats}</td><td>${confirmed}</td><td><span class="status status--${status}">${statusLabel(status)}</span></td><td><div class="row-actions"><button class="mini-btn" title="Copiar link" data-copy="${inv.id}">Link</button><button class="mini-btn" title="Enviar pelo WhatsApp" data-whatsapp="${inv.id}">WhatsApp</button><button class="mini-btn" title="Editar convite" data-edit="${inv.id}">Editar</button><button class="mini-btn" title="Invalidar o link antigo e gerar outro" data-regenerate="${inv.id}">Novo token</button><button class="mini-btn mini-btn--danger" title="Excluir" data-delete="${inv.id}">×</button></div></td></tr>`;
}
function filteredInvitations() {
  const q = $("#searchInput").value.trim().toLowerCase(); const filter = $("#statusFilter").value;
  return state.invitations.filter(i => {
    const memberNames = membersOf(i).join(" ");
    const matches = !q || [i.display_name,i.contact_name,i.phone,i.category,memberNames].some(v => String(v||"").toLowerCase().includes(q));
    return matches && (filter === "all" || statusOf(i) === filter);
  });
}
function renderTables() {
  $("#dashboardRows").innerHTML = state.invitations.slice(0,5).map(i => rowHtml(i,true)).join("") || `<tr><td colspan="5" class="muted">Nenhum convite cadastrado.</td></tr>`;
  const filtered = filteredInvitations();
  $("#guestRows").innerHTML = filtered.map(i => rowHtml(i)).join(""); $("#guestEmpty").hidden = filtered.length > 0;
}
function renderSettings() {
  const w = currentWedding(); const f = $("#weddingForm");
  for (const name of ["name","slug","event_date","invite_base_url"]) f.elements[name].value = w?.[name] || "";
}
function renderAll(){ renderStats(); renderTables(); renderSettings(); }

function openInvite(id=null) {
  state.editId = id; const form = $("#inviteForm"); form.reset(); form.elements.seats.value = 1; form.elements.id.value = id || "";
  $("#inviteDialogTitle").textContent = id ? "Editar convite" : "Adicionar convidado";
  if (id) {
    const item = state.invitations.find(i => i.id === id);
    ["display_name","contact_name","phone","seats","category","notes"].forEach(k => form.elements[k].value = item?.[k] ?? "");
    form.elements.members.value = membersOf(item).join("\n");
  }
  $("#inviteDialog").showModal();
}
function closeInvite(){ $("#inviteDialog").close(); }
function openWedding(){ const f=$("#newWeddingForm"); f.reset(); f.elements.invite_base_url.value=CONFIG.defaultInviteBaseUrl||""; $("#weddingDialog").showModal(); }

function resetImportDialog(){
  state.importRows = [];
  $("#importFile").value = ""; $("#importResult").hidden = true; $("#importStatus").textContent = "";
  $("#importErrors").innerHTML = ""; $("#importPreviewRows").innerHTML = ""; $("#confirmImportButton").disabled = true;
}
function openImport(){
  if (!state.weddingId) return toast("Crie ou selecione um casamento antes de importar.");
  resetImportDialog();
  $("#downloadImportTemplate").href = CONFIG.importTemplateUrl || "../modelos/modelo-importacao-convidados.xlsx";
  $("#importMaxRowsLabel").textContent = maxImportRows();
  $("#importDialog").showModal();
}
function closeImport(){ $("#importDialog").close(); resetImportDialog(); }
function renderImportReview(result){
  state.importRows = result.valid; $("#importResult").hidden = false;
  $("#importValidCount").textContent = result.valid.length; $("#importIgnoredCount").textContent = result.ignored; $("#importErrorCount").textContent = result.errors.length;
  $("#importErrorsWrap").hidden = result.errors.length === 0;
  $("#importErrors").innerHTML = result.errors.slice(0, 20).map(e => `<li>${escapeHtml(e)}</li>`).join("") + (result.errors.length > 20 ? `<li>... e mais ${result.errors.length - 20} erro(s).</li>` : "");
  $("#importPreviewWrap").hidden = result.valid.length === 0;
  $("#importPreviewRows").innerHTML = result.valid.slice(0,8).map(i => `<tr><td>${escapeHtml(i.display_name)}</td><td>${escapeHtml(i.contact_name || "—")}</td><td>${escapeHtml(i.phone || "—")}</td><td>${i.seats}</td><td>${escapeHtml(i.members?.join("; ") || "—")}</td><td>${escapeHtml(i.category || "—")}</td></tr>`).join("");
  $("#confirmImportButton").disabled = result.valid.length === 0 || result.errors.length > 0;
  $("#importStatus").textContent = result.errors.length ? "Corrija os erros na planilha e selecione o arquivo novamente." : (result.valid.length ? `Planilha validada: ${result.valid.length} convite(s) pronto(s) para importar.` : "Nenhum convidado válido encontrado.");
}
async function handleImportFile(file){
  if (!file) return;
  const status = $("#importStatus");
  try { status.textContent = "Lendo e validando a planilha..."; const result = await parseGuestWorkbook(file); renderImportReview(result); }
  catch (err) { state.importRows = []; $("#importResult").hidden = true; $("#confirmImportButton").disabled = true; status.textContent = err.message || "Não foi possível ler a planilha."; }
}
async function confirmImport(){
  if (!state.importRows.length) return;
  const button = $("#confirmImportButton"); const status = $("#importStatus"); const count = state.importRows.length;
  try { button.disabled = true; status.textContent = `Importando ${count} convite(s)...`; await backend.importInvitations(state.importRows); await refreshAll(state.weddingId); $("#importDialog").close(); resetImportDialog(); toast(`${count} convite(s) importado(s) com sucesso.`); }
  catch (err) { button.disabled = false; status.textContent = err.message || "Falha ao importar convidados."; }
}

function exportDataRows() {
  const w = currentWedding();
  return state.invitations.map(inv => {
    const r = rsvpOf(inv); const status = statusOf(inv);
    const guestNames = Array.isArray(r?.guest_names) ? r.guest_names : (Array.isArray(r?.guestNames) ? r.guestNames : []);
    return {
      "Convite / família": inv.display_name || "",
      "Responsável": inv.contact_name || "",
      "WhatsApp": inv.phone || "",
      "Lugares": Number(inv.seats || 0),
      "Membros cadastrados": membersOf(inv).join("; "),
      "Categoria": inv.category || "",
      "Status": statusLabel(status),
      "Confirmados": status === "confirmed" ? Number(r?.guest_count ?? r?.guestCount ?? 0) : 0,
      "Nomes confirmados": guestNames.join("; "),
      "Restrição alimentar": r?.meal_notes ?? r?.mealNotes ?? "",
      "Mensagem": r?.message || "",
      "Respondido em": formatDateTime(r?.responded_at ?? r?.respondedAt ?? ""),
      "Token": inv.token || "",
      "Link personalizado": buildLink(inv, w)
    };
  });
}
function exportFilename(ext) {
  const base = slugify(currentWedding()?.name || "convidados") || "convidados";
  return `${CONFIG.exportFilePrefix || "lista-convidados"}-${base}.${ext}`;
}
function exportExcel() {
  if (!state.invitations.length) return toast("Não há convidados para exportar.");
  if (!window.XLSX) return toast("Biblioteca de Excel não carregada.");
  const rows = exportDataRows();
  const ws = window.XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [26,22,18,10,34,16,14,12,34,28,36,20,34,58].map(wch => ({wch}));
  const wb = window.XLSX.utils.book_new(); window.XLSX.utils.book_append_sheet(wb, ws, "Convidados");
  window.XLSX.writeFile(wb, exportFilename("xlsx"));
  toast("Planilha exportada.");
}
function exportCsv() {
  if (!state.invitations.length) return toast("Não há convidados para exportar.");
  if (!window.XLSX) return toast("Biblioteca de exportação não carregada.");
  const ws = window.XLSX.utils.json_to_sheet(exportDataRows());
  const csv = "\ufeff" + window.XLSX.utils.sheet_to_csv(ws, { FS:";" });
  const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
  const a = document.createElement("a"); a.href = url; a.download = exportFilename("csv"); document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  toast("CSV exportado.");
}

async function copyLink(id){ const inv=state.invitations.find(i=>i.id===id); const link=buildLink(inv,currentWedding()); await navigator.clipboard.writeText(link); toast("Link personalizado copiado."); }
function whatsapp(id){ const inv=state.invitations.find(i=>i.id===id); const w=currentWedding(); const link=buildLink(inv,w); const text=`Olá, ${inv.display_name}! 💍\n\nPreparamos um convite especial para vocês.\n\nAcesse o convite personalizado:\n${link}`; const phone=String(inv.phone||"").replace(/\D/g,""); window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,"_blank","noopener"); }
async function regenerateToken(id) {
  const inv = state.invitations.find(i=>i.id===id); if (!inv) return;
  const ok = confirm(`Gerar um novo token para “${inv.display_name}”?\n\nO link atual deixará de funcionar imediatamente.`);
  if (!ok) return;
  await backend.regenerateToken(id); await refreshAll(state.weddingId); toast("Novo token gerado. O link anterior foi invalidado.");
}

function bindActions(){
  $$(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
  $("#mobileMenu").addEventListener("click",()=>$(".sidebar").classList.toggle("is-open"));
  $$('[data-open-invite]').forEach(b=>b.addEventListener("click",()=>openInvite()));
  $("[data-go-guests]").addEventListener("click",()=>showView("guests"));
  $("#newWeddingButton").addEventListener("click",openWedding);
  $("#importGuestsButton").addEventListener("click",openImport);
  $("#exportExcelButton").addEventListener("click",exportExcel);
  $("#exportCsvButton").addEventListener("click",exportCsv);
  $("#importFile").addEventListener("change",e=>handleImportFile(e.target.files?.[0]));
  $("#confirmImportButton").addEventListener("click",confirmImport);
  $$('[data-close-import]').forEach(b=>b.addEventListener("click",closeImport));
  $$('[data-close-dialog]').forEach(b=>b.addEventListener("click",closeInvite));
  $$('[data-close-wedding]').forEach(b=>b.addEventListener("click",()=>$("#weddingDialog").close()));
  $("#weddingSelect").addEventListener("change",async e=>{state.weddingId=e.target.value;state.invitations=await backend.invitations(state.weddingId);renderAll()});
  $("#searchInput").addEventListener("input",renderTables); $("#statusFilter").addEventListener("change",renderTables);
  document.addEventListener("click",async e=>{
    const b=e.target.closest("button"); if(!b)return;
    try {
      if(b.dataset.copy) await copyLink(b.dataset.copy);
      if(b.dataset.whatsapp) whatsapp(b.dataset.whatsapp);
      if(b.dataset.edit) openInvite(b.dataset.edit);
      if(b.dataset.regenerate) await regenerateToken(b.dataset.regenerate);
      if(b.dataset.delete && confirm("Excluir este convite? Todos os membros e o RSVP vinculados também serão excluídos.")){await backend.deleteInvitation(b.dataset.delete);await refreshAll(state.weddingId);toast("Convite excluído.");}
    } catch(err){toast(err.message||"Ocorreu um erro.");}
  });
  $("#inviteForm").addEventListener("submit",async e=>{
    e.preventDefault(); const f=new FormData(e.currentTarget); const item=Object.fromEntries(f.entries()); item.id=item.id||null; item.seats=Number(item.seats); item.members=parseMembersValue(item.members);
    if (item.members.length > item.seats) return toast(`Há ${item.members.length} membros cadastrados para apenas ${item.seats} lugares.`);
    try { await backend.saveInvitation(item); closeInvite(); await refreshAll(state.weddingId); toast(item.id?"Convite atualizado.":"Convite criado."); } catch(err){toast(err.message||"Não foi possível salvar o convite.");}
  });
  $("#weddingForm").addEventListener("submit",async e=>{e.preventDefault();const item=Object.fromEntries(new FormData(e.currentTarget).entries());item.id=state.weddingId;try{await backend.saveWedding(item);await refreshAll(state.weddingId);toast("Casamento atualizado.")}catch(err){toast(err.message)}});
  $("#newWeddingForm").addEventListener("input",e=>{if(e.target.name==="name"&&!e.currentTarget.elements.slug.dataset.touched)e.currentTarget.elements.slug.value=slugify(e.target.value)}); $("#newWeddingForm").elements.slug.addEventListener("input",e=>e.target.dataset.touched="1");
  $("#newWeddingForm").addEventListener("submit",async e=>{e.preventDefault();const item=Object.fromEntries(new FormData(e.currentTarget).entries());try{await backend.saveWedding(item);$("#weddingDialog").close();await refreshAll();state.weddingId=state.weddings.at(-1)?.id||state.weddingId;await refreshAll(state.weddingId);toast("Casamento criado.")}catch(err){toast(err.message)}});
  $("#logoutButton").addEventListener("click",async()=>{await backend.logout();if (CONFIG.mode === "supabase") location.replace(CONFIG.loginPage || "../index.html");else location.reload();});
}

async function start(){
  $("#brandName").textContent = CONFIG.brandName || "Gestão de Convidados";
  $("#modeBadge").textContent = CONFIG.mode === "demo" ? "DEMO" : "SUPABASE";
  bindActions();
  state.user = await backend.currentUser();
  if (CONFIG.mode === "supabase" && !state.user) { location.replace(CONFIG.loginPage || "../index.html"); return; }
  const email = state.user?.email || "Administrador";
  $("#userEmail").textContent = email; $("#userInitial").textContent = email.slice(0,1).toUpperCase(); $("#userMode").textContent = CONFIG.mode === "demo" ? "Modo demonstração" : "Acesso autenticado";
  $("#authGuard").hidden = true; $("#app").hidden = false; await refreshAll();
  if (CONFIG.mode === "supabase") supabase.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") location.replace(CONFIG.loginPage || "../index.html"); });
}
start().catch(err=>{console.error(err);document.body.innerHTML=`<div style="padding:30px;font-family:sans-serif"><h1>Erro de configuração</h1><p>${escapeHtml(err.message)}</p></div>`});
