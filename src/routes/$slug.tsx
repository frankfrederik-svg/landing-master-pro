import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HotsiteForm } from "@/components/HotsiteForm";
import { LeadPopup } from "@/components/LeadPopup";
import { VilleDeLisboaTemplate } from "@/components/VilleDeLisboaTemplate";
import heroBuilding from "@/assets/hero-building.jpg";
import { formatCurrencyBRL, resolveImage } from "@/lib/faixa";
import { Building2, CheckCircle2, MapPin, Percent, Sparkles, TrendingDown, Wallet } from "lucide-react";

export const Route = createFileRoute("/$slug")({
  component: HotsitePage,
});

type Campaign = {
  id: string; slug: string; name: string;
  hero_title: string; hero_subtitle: string; cta_text: string;
  banner_url: string | null;
  whatsapp_number: string | null; whatsapp_message: string | null;
  popup_enabled: boolean;
  popup_delay_mobile: number;
  popup_delay_desktop: number;
  popup_frequency_hours: number;
  popup_title: string;
  popup_subtitle: string;
  popup_button_text: string;
  popup_whatsapp_message: string;
  layout?: string;
  layout_data?: any;
};
type Property = {
  id: string; name: string; location: string; image_url: string | null;
  entry_value: number | null; description: string | null; tag: string | null;
};

function PropertyImageGallery({ imageUrl, alt, tag, onClick }: { imageUrl: string | null; alt: string; tag: string | null; onClick: () => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!imageUrl) return;
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setImages(parsed.map(url => resolveImage(url)).filter(Boolean) as string[]);
      } else {
        const single = resolveImage(imageUrl);
        setImages(single ? [single] : []);
      }
    } catch {
      const single = resolveImage(imageUrl);
      setImages(single ? [single] : []);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-[4/3] items-center justify-center bg-muted cursor-pointer" onClick={onClick}>
        <Building2 className="h-12 w-12 text-muted-foreground" />
        {tag && (
          <Badge className="absolute left-3 top-3 border-0 bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/40 ring-2 ring-white animate-pulse z-10">
            🔥 {tag}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden cursor-pointer group" onClick={onClick}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${alt} - Foto ${i + 1}`}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${i === index ? 'opacity-100 scale-105 group-hover:scale-110' : 'opacity-0 scale-100'}`}
        />
      ))}
      {tag && (
        <Badge className="absolute left-3 top-3 border-0 bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/40 ring-2 ring-white animate-pulse z-10">
          🔥 {tag}
        </Badge>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${i === index ? 'w-5 bg-white' : 'w-2 bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function HotsitePage() {
  const { slug } = Route.useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: c, error: cErr } = await supabase
        .from("feirao_campaigns")
        .select("id,slug,name,hero_title,hero_subtitle,cta_text,banner_url,whatsapp_number,whatsapp_message,popup_enabled,popup_delay_mobile,popup_delay_desktop,popup_frequency_hours,popup_title,popup_subtitle,popup_button_text,popup_whatsapp_message,layout,layout_data")
        .eq("slug", slug).eq("active", true).maybeSingle();
      if (cErr) console.error("Erro ao buscar campanha:", cErr);
      if (!c) { setNotFoundFlag(true); setLoading(false); return; }
      setCampaign(c as Campaign);
      const { data: p } = await supabase
        .from("feirao_properties").select("id,name,location,image_url,entry_value,description,tag")
        .eq("campaign_id", c.id).eq("active", true).order("display_order", { ascending: true });
      setProperties(p ?? []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (notFoundFlag || !campaign) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Campanha não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">A campanha que você procura não existe ou está desativada.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Ir para o início
        </Link>
      </div>
    </div>
  );

  useEffect(() => {
    if (campaign) {
      document.title = campaign.layout === "ville_de_lisboa" ? "Ville de Lisboa - Caucaia" : campaign.name;
    }
  }, [campaign]);

  const hero = campaign?.banner_url || heroBuilding;
  const scrollToForm = () => document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });

  if (campaign.layout === "ville_de_lisboa") {
    return (
      <>
        <VilleDeLisboaTemplate campaign={campaign as any} properties={properties} />
        <LeadPopup
          campaignId={campaign.id}
          enabled={campaign.popup_enabled}
          delayMobile={campaign.popup_delay_mobile}
          delayDesktop={campaign.popup_delay_desktop}
          frequencyHours={campaign.popup_frequency_hours}
          title={campaign.popup_title}
          subtitle={campaign.popup_subtitle}
          buttonText={campaign.popup_button_text}
          whatsappNumber={campaign.whatsapp_number}
          whatsappMessage={campaign.popup_whatsapp_message}
        />
      </>
    );
  }

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

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: TrendingDown, t: "Menor taxa de juros", s: "do mercado" },
              { icon: Wallet, t: "Entrada facilitada em 72x", s: "parcelamos sua entrada" },
              { icon: Percent, t: "Use o Minha Casa Minha Vida", s: "direto com o banco CAIXA" },
            ].map((b) => (
              <div
                key={b.t}
                className="flex items-center gap-4 rounded-2xl border border-white/30 bg-white/15 px-5 py-4 shadow-elegant backdrop-blur-md transition-base hover:bg-white/25 hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-accent shadow-cta">
                  <b.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-tight text-primary-foreground md:text-lg">
                    {b.t}
                  </span>
                  <span className="text-xs font-medium text-primary-foreground/80 md:text-sm">
                    {b.s}
                  </span>
                </div>
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
            {properties.map((p) => (
              <div key={p.id} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-base hover:shadow-elegant">
                <PropertyImageGallery imageUrl={p.image_url} alt={p.name} tag={p.tag} onClick={scrollToForm} />
                <div className="space-y-3 p-5">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{p.location}</div>
                  {p.description && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>}
                  {p.entry_value != null && (
                    <div className="mt-2 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 transition-colors hover:bg-primary/5">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Renda ideal a partir de</span>
                      <p className="mt-1 flex items-baseline text-3xl font-black tracking-tight text-primary">
                        {formatCurrencyBRL(p.entry_value)}
                        <span className="ml-1.5 text-sm font-semibold tracking-normal text-muted-foreground/60">/mês</span>
                      </p>
                    </div>
                  )}
                  <Button onClick={scrollToForm} variant="hero" className="w-full">Tenho interesse</Button>
                </div>
              </div>
            ))}
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

      <LeadPopup
        campaignId={campaign.id}
        enabled={campaign.popup_enabled}
        delayMobile={campaign.popup_delay_mobile}
        delayDesktop={campaign.popup_delay_desktop}
        frequencyHours={campaign.popup_frequency_hours}
        title={campaign.popup_title}
        subtitle={campaign.popup_subtitle}
        buttonText={campaign.popup_button_text}
        whatsappNumber={campaign.whatsapp_number}
        whatsappMessage={campaign.popup_whatsapp_message}
      />
    </div>
  );
}
