import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HotsiteForm } from "@/components/HotsiteForm";
import { LeadPopup } from "@/components/LeadPopup";
import heroBuilding from "@/assets/hero-building.jpg";
import { formatCurrencyBRL, resolveImage } from "@/lib/faixa";
import { Building2, CheckCircle2, MapPin, Percent, Sparkles, TrendingDown, Wallet } from "lucide-react";

export const Route = createFileRoute("/c/$slug")({
  component: HotsitePage,
});

type Campaign = {
  id: string; slug: string; name: string;
  hero_title: string; hero_subtitle: string; cta_text: string;
  banner_url: string | null;
  whatsapp_number: string | null; whatsapp_message: string | null;
};
type Property = {
  id: string; name: string; location: string; image_url: string | null;
  entry_value: number | null; description: string | null; tag: string | null;
};

function HotsitePage() {
  const { slug } = Route.useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase
        .from("campaigns")
        .select("id,slug,name,hero_title,hero_subtitle,cta_text,banner_url,whatsapp_number,whatsapp_message")
        .eq("slug", slug).eq("active", true).maybeSingle();
      if (!c) { setNotFoundFlag(true); setLoading(false); return; }
      setCampaign(c as Campaign);
      const { data: p } = await supabase
        .from("properties").select("id,name,location,image_url,entry_value,description,tag")
        .eq("campaign_id", c.id).eq("active", true).order("display_order", { ascending: true });
      setProperties(p ?? []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (notFoundFlag || !campaign) throw notFound();

  const hero = campaign.banner_url || heroBuilding;
  const scrollToForm = () => document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="flex items-center gap-2 text-primary-foreground/90">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-medium">{campaign.name}</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
            {campaign.hero_title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">{campaign.hero_subtitle}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: TrendingDown, t: "Menor taxa de juros" },
              { icon: Wallet, t: "Entrada facilitada" },
              { icon: Percent, t: "Em até 72x" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                <b.icon className="h-5 w-5 text-primary-foreground" />
                <span className="font-medium text-primary-foreground">{b.t}</span>
              </div>
            ))}
          </div>

          <Button onClick={scrollToForm} variant="cta" size="xl" className="mt-8">
            {campaign.cta_text}
          </Button>
        </div>
      </section>

      {/* EMPREENDIMENTOS */}
      {properties.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Empreendimentos disponíveis</h2>
          <p className="mt-2 text-muted-foreground">Selecione o que mais combina com você.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => {
              const img = resolveImage(p.image_url);
              return (
                <div key={p.id} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-base hover:shadow-elegant">
                  {img ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={img} alt={p.name} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition-base group-hover:scale-105" />
                      {p.tag && <Badge className="absolute left-3 top-3 bg-gradient-accent text-accent-foreground">{p.tag}</Badge>}
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-muted"><Building2 className="h-12 w-12 text-muted-foreground" /></div>
                  )}
                  <div className="space-y-3 p-5">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{p.location}</div>
                    {p.description && <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                    {p.entry_value != null && (
                      <div className="rounded-xl bg-primary/5 p-3">
                        <span className="text-xs font-medium text-muted-foreground">Entrada a partir de</span>
                        <p className="text-xl font-bold text-primary">{formatCurrencyBRL(p.entry_value)}</p>
                      </div>
                    )}
                    <Button onClick={scrollToForm} variant="hero" className="w-full">Tenho interesse</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* FORM */}
      <section id="formulario" className="bg-gradient-soft py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Quero financiar meu apê
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
              Quero financiar meu apê com <span className="text-primary">entrada parcelada</span>
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">Descubra agora como sair do aluguel com condições facilitadas.</p>
            <ul className="mt-6 space-y-3">
              {[
                "Análise de crédito sem compromisso",
                "Simulação por faixa do Minha Casa Minha Vida",
                "Atendimento direto com especialista",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-success" /><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <HotsiteForm campaignId={campaign.id} whatsappNumber={campaign.whatsapp_number} whatsappMessage={campaign.whatsapp_message} />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Apê Fácil — Todos os direitos reservados</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground">Início</Link>
            {campaign.whatsapp_number && (
              <a href={`https://wa.me/${campaign.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="hover:text-foreground">WhatsApp</a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
