import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
import { submitLead } from "@/functions/leads.functions";
import { toast } from "sonner";

type Props = {
  campaignId: string;
  enabled: boolean;
  delayMobile: number;
  delayDesktop: number;
  frequencyHours: number;
  title: string;
  subtitle: string;
  buttonText: string;
  whatsappNumber?: string | null;
  whatsappMessage: string;
};

const STORAGE_PREFIX = "leadpopup:";
const SUBMITTED_PREFIX = "leadpopup-submitted:";

function maskWhatsapp(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function isMobile() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function LeadPopup({
  campaignId, enabled, delayMobile, delayDesktop, frequencyHours,
  title, subtitle, buttonText, whatsappNumber, whatsappMessage,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const key = STORAGE_PREFIX + campaignId;
    const submittedKey = SUBMITTED_PREFIX + campaignId;

    // Já capturado: não mostra mais nunca
    if (localStorage.getItem(submittedKey)) return;

    // Frequência: não mostra antes do tempo configurado
    const last = localStorage.getItem(key);
    if (last) {
      const elapsedHours = (Date.now() - parseInt(last, 10)) / 3_600_000;
      if (elapsedHours < frequencyHours) return;
    }

    const mobile = isMobile();
    const delaySec = mobile ? delayMobile : delayDesktop;

    const trigger = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      localStorage.setItem(key, String(Date.now()));
      setOpen(true);
    };

    // Trigger por tempo
    const timer = window.setTimeout(trigger, Math.max(1, delaySec) * 1000);

    // Desktop: exit-intent (mouse indo pro topo)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };

    // Mobile: troca de aba / minimizar / botão voltar
    const onVisibility = () => {
      if (document.visibilityState === "hidden") trigger();
    };
    const onPageHide = () => trigger();

    // Mobile: scroll parado por mais de 4s no meio da página
    let scrollIdleTimer: number | undefined;
    const onScroll = () => {
      if (scrollIdleTimer) window.clearTimeout(scrollIdleTimer);
      const scrolled = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? scrolled / docH : 0;
      if (pct > 0.25 && pct < 0.85) {
        scrollIdleTimer = window.setTimeout(trigger, 4000);
      }
    };

    if (mobile) {
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pagehide", onPageHide);
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      document.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      window.clearTimeout(timer);
      if (scrollIdleTimer) window.clearTimeout(scrollIdleTimer);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("scroll", onScroll);
    };
  }, [campaignId, enabled, delayMobile, delayDesktop, frequencyHours]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    setSubmitting(true);
    const res = await submitLead({
      data: {
        campaign_id: campaignId,
        property_id: null,
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        income_range: "Pop-up (não informado)",
        mcmv_faixa: null,
        uses_entry_value: false,
        entry_value: null,
        joins_income: false,
        birth_date: null,
        income_type: null,
        has_fgts: false,
        clean_name: true,
      },
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.error || "Erro ao enviar.");
      return;
    }

    localStorage.setItem(SUBMITTED_PREFIX + campaignId, "1");
    toast.success("Pronto! Em instantes você recebe no WhatsApp.");
    setOpen(false);

    if (whatsappNumber) {
      const msg = encodeURIComponent(`${whatsappMessage} — Sou ${name}.`);
      const num = whatsappNumber.replace(/\D/g, "");
      window.open(`https://wa.me/${num}?text=${msg}`, "_blank", "noopener");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-elegant">
        <div className="bg-gradient-primary p-6 text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Oferta por tempo limitado
          </div>
          <h2 className="mt-3 text-2xl font-bold leading-tight">{title}</h2>
          <p className="mt-2 text-sm text-primary-foreground/90">{subtitle}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="popup-name">Nome</Label>
            <Input id="popup-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" autoFocus={false} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-wpp">WhatsApp</Label>
            <Input id="popup-wpp" required value={whatsapp} onChange={(e) => setWhatsapp(maskWhatsapp(e.target.value))} placeholder="(11) 90000-0000" inputMode="tel" />
          </div>
          <Button type="submit" variant="cta" size="xl" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageCircle className="mr-2 h-5 w-5" />}
            {submitting ? "Enviando..." : buttonText}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            🔒 As melhores unidades com entrada parcelada acabam rápido.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
