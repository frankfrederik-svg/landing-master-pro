import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const LeadSchema = z.object({
  campaign_id: z.string().uuid().nullable(),
  property_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(8).max(25),
  income_range: z.string().trim().min(1).max(50),
  mcmv_faixa: z.number().int().min(1).max(4).nullable().optional(),
  uses_entry_value: z.boolean().optional(),
  entry_value: z.number().nullable().optional(),
  joins_income: z.boolean().optional(),
  birth_date: z.string().nullable().optional(),
  income_type: z.string().nullable().optional(),
  has_fgts: z.boolean().optional(),
  clean_name: z.boolean().optional(),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const { error, data: inserted } = await supabaseAdmin
      .from("feirao_leads")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("submitLead error:", error);
      return { ok: false, error: "Não foi possível salvar agora. Tente novamente." };
    }

    // Webhook opcional
    try {
      const { data: settings } = await supabaseAdmin
        .from("feirao_settings").select("webhook_url").eq("id", 1).maybeSingle();
      if (settings?.webhook_url) {
        await fetch(settings.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "lead.created", lead: inserted }),
        }).catch((e) => console.error("webhook fail:", e));
      }
    } catch (e) {
      console.error("settings/webhook fail:", e);
    }

    return { ok: true, id: inserted.id };
  });
