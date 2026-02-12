import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum arquivo enviado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      uploaded: [] as string[],
      skipped: [] as string[],
      errors: [] as { file: string; error: string }[],
    };

    for (const file of files) {
      const filePath = `dCAIP_Images/${file.name}`;

      try {
        // Check if the file already exists by trying to get its public URL info
        const { data: existingFiles } = await supabase.storage
          .from("caip-images")
          .list("dCAIP_Images", {
            search: file.name,
            limit: 1,
          });

        const alreadyExists = existingFiles?.some((f) => f.name === file.name);

        if (alreadyExists) {
          results.skipped.push(file.name);
          continue;
        }

        // Upload the file
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("caip-images")
          .upload(filePath, arrayBuffer, {
            contentType: file.type || "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          // Could be a race condition duplicate
          if (uploadError.message?.includes("already exists") || uploadError.message?.includes("Duplicate")) {
            results.skipped.push(file.name);
          } else {
            results.errors.push({ file: file.name, error: uploadError.message });
          }
        } else {
          results.uploaded.push(file.name);
        }
      } catch (err) {
        results.errors.push({ file: file.name, error: String(err) });
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
