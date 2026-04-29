import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Campaign = { id: string; slug: string; name: string; hero_subtitle: string };

function Index() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("campaigns").select("id,slug,name,hero_subtitle").eq("active", true).order("created_at", { ascending: false })
      .then(({ data }) => { setCampaigns(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Building2 className="h-5 w-5" /></div>
            <span className="text-lg font-bold">Apê Fácil</span>
          </div>
          <Link to="/admin"><Button variant="outline" size="sm">Painel admin</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" /> Plataforma de hotsites imobiliários
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
          Campanhas que <span className="bg-gradient-primary bg-clip-text text-transparent">convertem mais</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Cada campanha tem sua landing page otimizada com classificação automática por faixa do Minha Casa Minha Vida.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-6 text-2xl font-bold">Campanhas ativas</h2>
        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">
            Nenhuma campanha ativa. Acesse o painel admin para criar.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <Link key={c.id} to="/c/$slug" params={{ slug: c.slug }} className="group rounded-2xl border bg-card p-6 shadow-sm transition-base hover:shadow-elegant">
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.hero_subtitle}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Ver hotsite <ArrowRight className="h-4 w-4 transition-base group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
