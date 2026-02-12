import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map image type from filename to database column
const IMAGE_TYPE_MAP: Record<string, string> = {
  "Imagem Geral": "imagem_geral",
  "Imagem Fachada": "imagem_fachada",
  "Imagem Lateral 1": "imagem_lateral_1",
  "Imagem Lateral 2": "imagem_lateral_2",
  "Imagem Fundos": "imagem_fundos",
  "Imagem Sala Cofre": "imagem_sala_cofre",
  "Imagem Cofre": "imagem_cofre",
  "Imagem Interna Alojamento Masculino": "imagem_interna_alojamento_masculino",
  "Imagem Interna Alojamento Feminino": "imagem_interna_alojamento_feminino",
  "Imagem Interna Plantão UOP": "imagem_interna_plantao_uop",
};

// Parse filename like "0cec8139.Imagem Fachada.135429.jpg"
function parseImageFilename(filename: string): { idCaip: string; imageType: string; dbColumn: string } | null {
  // Pattern: {id_caip}.{Imagem Tipo}.{timestamp}.{ext}
  const match = filename.match(/^([^.]+)\.(Imagem [^.]+)\.(\d+)\.\w+$/);
  if (!match) return null;

  const idCaip = match[1];
  const imageType = match[2];
  const dbColumn = IMAGE_TYPE_MAP[imageType];

  if (!dbColumn) return null;
  return { idCaip, imageType, dbColumn };
}

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
      linked: [] as string[],
      linkErrors: [] as { file: string; error: string }[],
    };

    for (const file of files) {
      const filePath = `dCAIP_Images/${file.name}`;

      try {
        // Check if the file already exists
        const { data: existingFiles } = await supabase.storage
          .from("caip-images")
          .list("dCAIP_Images", {
            search: file.name,
            limit: 1,
          });

        const alreadyExists = existingFiles?.some((f) => f.name === file.name);

        if (alreadyExists) {
          results.skipped.push(file.name);
        } else {
          // Upload the file
          const arrayBuffer = await file.arrayBuffer();
          const { error: uploadError } = await supabase.storage
            .from("caip-images")
            .upload(filePath, arrayBuffer, {
              contentType: file.type || "image/jpeg",
              upsert: false,
            });

          if (uploadError) {
            if (uploadError.message?.includes("already exists") || uploadError.message?.includes("Duplicate")) {
              results.skipped.push(file.name);
            } else {
              results.errors.push({ file: file.name, error: uploadError.message });
              continue; // Skip linking if upload failed
            }
          } else {
            results.uploaded.push(file.name);
          }
        }

        // After upload (or skip), link the image to the database record
        const parsed = parseImageFilename(file.name);
        if (parsed) {
          const { idCaip, dbColumn } = parsed;
          const storagePath = `dCAIP_Images/${file.name}`;

          // Find the record by id_caip
          const { data: records, error: findError } = await supabase
            .from("dados_caip")
            .select("id")
            .eq("id_caip", idCaip);

          if (findError) {
            results.linkErrors.push({ file: file.name, error: `Erro ao buscar registro: ${findError.message}` });
            continue;
          }

          if (!records || records.length === 0) {
            results.linkErrors.push({ file: file.name, error: `Registro com id_caip '${idCaip}' não encontrado` });
            continue;
          }

          // Update all matching records (could be multiple years)
          for (const record of records) {
            const { error: updateError } = await supabase
              .from("dados_caip")
              .update({ [dbColumn]: storagePath })
              .eq("id", record.id);

            if (updateError) {
              results.linkErrors.push({ file: file.name, error: `Erro ao vincular: ${updateError.message}` });
            } else {
              results.linked.push(file.name);
            }
          }
        } else {
          results.linkErrors.push({ file: file.name, error: "Nome do arquivo não segue o padrão esperado" });
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
