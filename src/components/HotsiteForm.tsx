import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { classifyFaixa, INCOME_OPTIONS, IncomeRange } from "@/lib/faixa";
import { submitLead } from "@/server/leads.functions";
import { toast } from "sonner";

type Props = {
  campaignId: string;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
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

export function HotsiteForm({ campaignId, whatsappNumber, whatsappMessage }: Props) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [income, setIncome] = useState<IncomeRange | "">("");
  const [usesEntry, setUsesEntry] = useState<"sim" | "nao">("nao");
  const [entryValue, setEntryValue] = useState("");
  const [joinsIncome, setJoinsIncome] = useState<"sim" | "nao">("nao");
  const [birthDate, setBirthDate] = useState("");
  const [incomeType, setIncomeType] = useState("");
  const [hasFgts, setHasFgts] = useState<"sim" | "nao">("nao");
  const [cleanName, setCleanName] = useState<"sim" | "nao">("sim");
  const [submitting, setSubmitting] = useState(false);

  const faixa = useMemo(() => (income ? classifyFaixa(income) : null), [income]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !income) {
      toast.error("Preencha nome, WhatsApp e renda.");
      return;
    }
    setSubmitting(true);
    const res = await submitLead({
      data: {
        campaign_id: campaignId,
        property_id: null,
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        income_range: INCOME_OPTIONS.find((o) => o.value === income)?.label ?? income,
        mcmv_faixa: faixa?.faixa ?? null,
        uses_entry_value: usesEntry === "sim",
        entry_value: usesEntry === "sim" ? parseMoney(entryValue) : null,
        joins_income: joinsIncome === "sim",
        birth_date: birthDate || null,
        income_type: incomeType || null,
        has_fgts: hasFgts === "sim",
        clean_name: cleanName === "sim",
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
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl bg-card p-6 shadow-elegant md:p-8">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wpp">WhatsApp</Label>
        <Input id="wpp" required value={whatsapp} onChange={(e) => setWhatsapp(maskWhatsapp(e.target.value))} placeholder="(11) 90000-0000" />
      </div>

      <div className="space-y-2">
        <Label>Renda familiar bruta</Label>
        <Select value={income} onValueChange={(v) => setIncome(v as IncomeRange)}>
          <SelectTrigger><SelectValue placeholder="Selecione sua faixa de renda" /></SelectTrigger>
          <SelectContent>
            {INCOME_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {faixa && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border-2 border-success/40 bg-success/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="font-semibold text-success">👉 Você se encaixa na {faixa.title}</p>
              <p className="text-sm text-foreground/80">{faixa.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Vai usar valor para abater na entrada?</Label>
          <RadioGroup value={usesEntry} onValueChange={(v) => setUsesEntry(v as "sim" | "nao")} className="flex gap-4">
            <label className="flex items-center gap-2"><RadioGroupItem value="sim" /> Sim</label>
            <label className="flex items-center gap-2"><RadioGroupItem value="nao" /> Não</label>
          </RadioGroup>
        </div>
        {usesEntry === "sim" && (
          <div className="space-y-2">
            <Label>Valor aproximado</Label>
            <Input value={entryValue} onChange={(e) => setEntryValue(maskMoney(e.target.value))} placeholder="R$ 0,00" inputMode="numeric" />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Vai juntar renda com alguém?</Label>
          <RadioGroup value={joinsIncome} onValueChange={(v) => setJoinsIncome(v as "sim" | "nao")} className="flex gap-4">
            <label className="flex items-center gap-2"><RadioGroupItem value="sim" /> Sim</label>
            <label className="flex items-center gap-2"><RadioGroupItem value="nao" /> Não</label>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Data de nascimento (mais velho)</Label>
          <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Tipo de renda</Label>
          <Select value={incomeType} onValueChange={setIncomeType}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {incomeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Possui FGTS?</Label>
          <RadioGroup value={hasFgts} onValueChange={(v) => setHasFgts(v as "sim" | "nao")} className="flex gap-4 pt-2">
            <label className="flex items-center gap-2"><RadioGroupItem value="sim" /> Sim</label>
            <label className="flex items-center gap-2"><RadioGroupItem value="nao" /> Não</label>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Nome limpo?</Label>
          <RadioGroup value={cleanName} onValueChange={(v) => setCleanName(v as "sim" | "nao")} className="flex gap-4 pt-2">
            <label className="flex items-center gap-2"><RadioGroupItem value="sim" /> Sim</label>
            <label className="flex items-center gap-2"><RadioGroupItem value="nao" /> Não</label>
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" variant="cta" size="xl" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageCircle className="mr-2 h-5 w-5" />}
        {submitting ? "Enviando..." : "Falar com especialista"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        🔒 Seus dados estão seguros. Usamos apenas para entrar em contato.
      </p>
    </form>
  );
}
