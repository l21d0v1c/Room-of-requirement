import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { thing } = await req.json();

  const { data, error } = await supabase
    .from("things") // ← change si ta table a un autre nom
    .select("first_download_at")
    .eq("thing", thing) // ← change si ton champ s'appelle différemment
    .single();

  if (!data || error) {
    return new Response("Not found", { status: 404 });
  }

  if (!data.first_download_at) {
    await supabase
      .from("things")
      .update({ first_download_at: new Date().toISOString() })
      .eq("thing", thing);
  }

  return new Response("Download logged", { status: 200 });
});
//petit comm de deployement
