import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Récupère les fichiers téléchargés il y a plus de 48h
  const { data, error } = await supabase
    .from("things")
    .select("thing, file_path")
    .lt("first_download_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error("Erreur lors de la récupération :", error.message);
    return new Response("Error", { status: 500 });
  }

  if (!data || data.length === 0) {
    return new Response("Aucun fichier à supprimer", { status: 200 });
  }

  for (const item of data) {
    if (item.file_path) {
      // Supprime le fichier du bucket
      await supabase.storage.from("things").remove([item.file_path]);
    }

    // Supprime la ligne dans la table
    await supabase.from("things").delete().eq("thing", item.thing);
  }

  return new Response("Fichiers expirés supprimés", { status: 200 });
});
// je tape un commentaire pour dans ce fichier pour lancer le workflow github
