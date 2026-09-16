import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ALLOWED = (Deno.env.get("INVITE_ALLOWED_ORIGINS") || "*").split(",").map(v => v.trim()).filter(Boolean);
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

function cors(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED.includes("*") ? "*" : ALLOWED.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8"
  };
}
function json(req: Request, body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: cors(req) }); }
function cleanText(v: unknown, max = 500) { return String(v ?? "").trim().slice(0, max); }

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Método não permitido" }, 405);
  if (!ALLOWED.includes("*") && !ALLOWED.includes(req.headers.get("origin") || "")) return json(req, { error: "Origem não permitida" }, 403);

  try {
    const body = await req.json();
    const action = cleanText(body.action, 20);
    const token = cleanText(body.token, 120);
    if (!token || token.length < 20) return json(req, { error: "Convite inválido" }, 400);

    const { data: invitation, error } = await db.from("invitations")
      .select("id,display_name,seats,active,wedding_id,weddings(name,event_date),invitation_members(name,sort_order),rsvps(attending,guest_count,submitted_name,guest_names,meal_notes,message,responded_at)")
      .eq("token", token).maybeSingle();
    if (error) throw error;
    if (!invitation || !invitation.active) return json(req, { error: "Convite não encontrado" }, 404);

    const existing = Array.isArray(invitation.rsvps) ? invitation.rsvps[0] || null : invitation.rsvps || null;
    const wedding = Array.isArray(invitation.weddings) ? invitation.weddings[0] : invitation.weddings;
    const members = Array.isArray(invitation.invitation_members)
      ? [...invitation.invitation_members].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((m: any) => cleanText(m.name, 160)).filter(Boolean)
      : [];

    if (action === "lookup") {
      return json(req, {
        invitation: {
          displayName: invitation.display_name,
          seats: invitation.seats,
          weddingName: wedding?.name || "",
          eventDate: wedding?.event_date || null,
          members,
          rsvp: existing ? {
            attending: existing.attending,
            guestCount: existing.guest_count,
            submittedName: existing.submitted_name || "",
            guestNames: existing.guest_names || [],
            mealNotes: existing.meal_notes || "",
            message: existing.message || "",
            respondedAt: existing.responded_at
          } : null
        }
      });
    }

    if (action === "rsvp") {
      if (typeof body.attending !== "boolean") return json(req, { error: "Resposta de presença inválida" }, 400);
      const attending = body.attending;
      const count = attending ? Number(body.guestCount) : 0;
      if (!Number.isInteger(count) || count < 0 || count > invitation.seats) return json(req, { error: `Quantidade permitida: até ${invitation.seats}` }, 400);
      if (attending && count < 1) return json(req, { error: "Informe ao menos 1 pessoa" }, 400);
      const guestNames = Array.isArray(body.guestNames) ? body.guestNames.map((n: unknown) => cleanText(n, 120)).filter(Boolean).slice(0, invitation.seats) : [];
      if (members.length && guestNames.some((name: string) => !members.includes(name))) return json(req, { error: "Um ou mais nomes não pertencem a este convite." }, 400);
      if (members.length && attending && guestNames.length !== count) return json(req, { error: "Selecione exatamente quem estará presente." }, 400);
      const payload = {
        invitation_id: invitation.id,
        attending,
        guest_count: count,
        submitted_name: cleanText(body.submittedName, 160),
        guest_names: guestNames,
        meal_notes: cleanText(body.mealNotes, 500),
        message: cleanText(body.message, 1200),
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { error: upsertError } = await db.from("rsvps").upsert(payload, { onConflict: "invitation_id" });
      if (upsertError) throw upsertError;
      return json(req, { ok: true, message: "Confirmação registrada com sucesso." });
    }

    return json(req, { error: "Ação inválida" }, 400);
  } catch (error) {
    console.error(error);
    return json(req, { error: "Não foi possível processar a solicitação." }, 500);
  }
});
