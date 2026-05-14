import { useState, useMemo } from "react";
import { COUNTRY_CODES } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { classifyFaixa, INCOME_OPTIONS, IncomeRange } from "@/lib/faixa";
import { submitLead } from "@/functions/leads.functions";
import { toast } from "sonner";

type Props = {
  campaignId: string;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
  buttonText?: string;
};

const incomeTypes = ["CLT", "Autônomo", "Servidor público", "Empresário"];

function maskMoney(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function parseMoney(s: string): number | null {
  const d = s.replace(/\D/g, "");
  if (!d) return null;
  return parseInt(d, 10) / 100;
}
function maskWhatsapp(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function HotsiteForm({ campaignId, whatsappNumber, whatsappMessage, buttonText }: Props) {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+55");
  const [whatsapp, setWhatsapp] = useState("");
  const [income, setIncome] = useState<IncomeRange | "">("");
  const [incomeType, setIncomeType] = useState("");
  const [hasFgts, setHasFgts] = useState<"sim" | "nao">("nao");
  const [fgtsValue, setFgtsValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const faixa = useMemo(() => (income ? classifyFaixa(income) : null), [income]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !income) {
      toast.error("Preencha nome, WhatsApp e renda.");
      return;
    }
    setSubmitting(true);
    const parsedFgts = parseMoney(fgtsValue);
    const res = await submitLead({
      data: {
        campaign_id: campaignId,
        property_id: null,
        name: name.trim(),
        whatsapp: `${countryCode} ${whatsapp.trim()}`,
        income_range: INCOME_OPTIONS.find((o) => o.value === income)?.label ?? income,
        mcmv_faixa: faixa?.faixa ?? null,
        uses_entry_value: hasFgts === "sim" && parsedFgts !== null,
        entry_value: hasFgts === "sim" ? parsedFgts : null,
        joins_income: false,
        birth_date: null,
        income_type: incomeType || null,
        has_fgts: hasFgts === "sim",
        clean_name: true,
      },
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.error || "Erro ao enviar.");
      return;
    }
    toast.success("Recebemos seus dados! Em breve nosso especialista entra em contato.");

    if (whatsappNumber) {
      const msg = encodeURIComponent(
        `${whatsappMessage ?? "Olá! Tenho interesse em um apê."} Sou ${name}, faixa ${faixa?.faixa}.`,
      );
      const num = whatsappNumber.replace(/\D/g, "");
      window.open(`https://wa.me/${num}?text=${msg}`, "_blank", "noopener");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 md:gap-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base">Nome completo</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="h-12 text-base" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wpp" className="text-base">WhatsApp</Label>
        <div className="flex gap-3">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger className="w-[120px] shrink-0 h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            id="wpp" 
            required 
            className="flex-1 h-12 text-base"
            value={whatsapp} 
            onChange={(e) => {
              if (countryCode === "+55") {
                setWhatsapp(maskWhatsapp(e.target.value));
              } else {
                setWhatsapp(e.target.value.replace(/[^\d\s()-]/g, ""));
              }
            }} 
            placeholder={countryCode === "+55" ? "(11) 90000-0000" : "Número"} 
            inputMode="tel"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base">Renda familiar bruta</Label>
        <Select value={income} onValueChange={(v) => setIncome(v as IncomeRange)}>
          <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Selecione sua faixa de renda" /></SelectTrigger>
          <SelectContent>
            {INCOME_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {faixa && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border-2 border-success/40 bg-success/10 p-4 form-full-row md:col-span-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="font-semibold text-success">👉 Você se encaixa na {faixa.title}</p>
              <p className="text-sm text-foreground/80">{faixa.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:gap-5 md:grid-cols-2 form-full-row md:col-span-2">
        <div className="space-y-2">
          <Label className="text-base">Tipo de renda</Label>
          <Select value={incomeType} onValueChange={setIncomeType}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {incomeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-base">Possui FGTS?</Label>
          <RadioGroup value={hasFgts} onValueChange={(v) => { setHasFgts(v as "sim" | "nao"); if (v === "nao") setFgtsValue(""); }} className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-base"><RadioGroupItem value="sim" className="h-5 w-5" /> Sim</label>
            <label className="flex items-center gap-2 cursor-pointer text-base"><RadioGroupItem value="nao" className="h-5 w-5" /> Não</label>
          </RadioGroup>
        </div>
        
        {hasFgts === "sim" && (
          <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
            <Label className="text-base">Qual o saldo aproximado do seu FGTS?</Label>
            <Input 
              value={fgtsValue} 
              onChange={(e) => setFgtsValue(maskMoney(e.target.value))} 
              placeholder="R$ 0,00" 
              className="h-12 text-base" 
              inputMode="numeric"
            />
          </div>
        )}
      </div>

      <Button type="submit" variant="cta" className="w-full min-h-[4rem] h-auto py-3 px-3 text-[13px] md:text-lg font-bold shadow-lg hover:shadow-xl transition-all" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-5 w-5 shrink-0 animate-spin" /> : <MessageCircle className="mr-2 h-5 w-5 shrink-0" />}
        <span className="whitespace-normal leading-tight">
          {submitting ? "Enviando..." : (buttonText || "Falar com especialista")}
        </span>
      </Button>
    </form>
  );
}
