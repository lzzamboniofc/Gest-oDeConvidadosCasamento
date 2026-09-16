import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const PUBLIC_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
const SECRET_KEY = Deno.env.get("SUPABASE_SECRET_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ALLOWED = (Deno.env.get("ADMIN_ALLOWED_ORIGINS") || "*").split(",").map(v => v.trim()).filter(Boolean);

const admin = createClient(SUPABASE_URL, SECRET_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
const publicClient = createClient(SUPABASE_URL, PUBLIC_KEY, { auth: { persistSession:false, autoRefreshToken:false } });

function headers(req: Request) {
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
function json(req:Request, value:unknown, status=200){ return new Response(JSON.stringify(value), {status, headers:headers(req)}); }
function text(value:unknown, max=200){ return String(value ?? "").trim().slice(0,max); }

async function authenticatedAdmin(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data:{ user }, error } = await publicClient.auth.getUser(token);
  if (error || !user) return null;
  const { data:profile, error:profileError } = await admin.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (profileError || profile?.role !== "admin") return null;
  return user;
}

async function findUserByEmail(email:string) {
  for (let page=1; page<=20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 500 });
    if (error) throw error;
    const found = data.users.find(u => String(u.email || "").toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 500) break;
  }
  return null;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers:headers(req) });
  if (req.method !== "POST") return json(req,{error:"Método não permitido"},405);
  if (!PUBLIC_KEY || !SECRET_KEY) return json(req,{error:"Chaves do Supabase não configuradas na função."},500);
  if (!ALLOWED.includes("*") && !ALLOWED.includes(req.headers.get("origin") || "")) return json(req,{error:"Origem não permitida"},403);

  try {
    const caller = await authenticatedAdmin(req);
    if (!caller) return json(req,{error:"Acesso administrativo necessário."},403);

    const body = await req.json();
    if (text(body.action,30) !== "invite") return json(req,{error:"Ação inválida."},400);
    const weddingId = text(body.weddingId,80);
    const email = text(body.email,254).toLowerCase();
    const displayName = text(body.displayName,160);
    const redirectTo = text(body.redirectTo,500);
    if (!weddingId || !email || !email.includes("@")) return json(req,{error:"Casamento e e-mail são obrigatórios."},400);

    const { data:wedding, error:weddingError } = await admin.from("weddings").select("id,name").eq("id",weddingId).maybeSingle();
    if (weddingError) throw weddingError;
    if (!wedding) return json(req,{error:"Casamento não encontrado."},404);

    let user = await findUserByEmail(email);
    let invited = false;
    if (!user) {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, redirectTo ? { redirectTo, data:{ display_name:displayName } } : { data:{ display_name:displayName } });
      if (error) throw error;
      user = data.user;
      invited = true;
    }
    if (!user) return json(req,{error:"Não foi possível criar ou localizar o usuário."},500);

    const { data:existingProfile, error:profileReadError } = await admin.from("profiles").select("role").eq("user_id",user.id).maybeSingle();
    if (profileReadError) throw profileReadError;
    if (existingProfile?.role !== "admin") {
      const { error:profileError } = await admin.from("profiles").upsert({ user_id:user.id, email, display_name:displayName || email, role:"couple" }, { onConflict:"user_id" });
      if (profileError) throw profileError;
    }

    const { error:membershipError } = await admin.from("wedding_members").upsert({ wedding_id:weddingId, user_id:user.id, email, display_name:displayName || email, access_role:"couple" }, { onConflict:"wedding_id,user_id" });
    if (membershipError) throw membershipError;

    return json(req,{ok:true, invited, existing:!invited, weddingName:wedding.name});
  } catch(error) {
    console.error(error);
    return json(req,{error:error instanceof Error ? error.message : "Não foi possível criar o acesso."},500);
  }
});
