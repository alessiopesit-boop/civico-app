// Civico - Edge Function: delete-account
//
// Cancella l'account dell'utente che la chiama. Il client (con chiave pubblica)
// NON puo' auto-cancellarsi: serve la service_role, che vive solo qui lato
// server. La funzione:
//   1. identifica chi chiama dal suo JWT,
//   2. anonimizza le sue segnalazioni (restano nella memoria di zona, senza
//      autore), come da policy privacy,
//   3. cancella l'utente: il cascade rimuove profilo e conferme collegate.
//
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono forniti in automatico
// dall'ambiente delle Edge Function (non vanno configurati a mano).

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Autenticazione mancante." }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Identifica chi chiama dal suo token.
  const token = authHeader.replace("Bearer ", "").trim();
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) return json({ error: "Token non valido." }, 401);
  const userId = userData.user.id;

  // 1) Anonimizza le segnalazioni dell'utente (restano, senza autore).
  await admin.from("reports").update({ author_label: null, anon: true }).eq("author_id", userId);

  // 2) Cancella l'utente: il cascade rimuove profilo e conferme.
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) return json({ error: delErr.message }, 500);

  return json({ ok: true });
});
