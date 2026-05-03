import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, Copy, Download, ExternalLink, KeyRound, LogOut, MessageCircle, Pencil, Plus, Trash2, UserPlus, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyBRL } from "@/lib/faixa";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Campaign = { id: string; slug: string; name: string; hero_title: string; hero_subtitle: string; cta_text: string; primary_color: string; accent_color: string; banner_url: string | null; whatsapp_number: string | null; whatsapp_message: string | null; active: boolean; popup_enabled: boolean; popup_delay_mobile: number; popup_delay_desktop: number; popup_frequency_hours: number; popup_title: string; popup_subtitle: string; popup_button_text: string; popup_whatsapp_message: string };
type Property = { id: string; campaign_id: string; name: string; location: string; image_url: string | null; entry_value: number | null; description: string | null; tag: string | null; active: boolean };
type Lead = { id: string; campaign_id: string | null; name: string; whatsapp: string; income_range: string; mcmv_faixa: number | null; uses_entry_value: boolean; entry_value: number | null; joins_income: boolean; birth_date: string | null; income_type: string | null; has_fgts: boolean; clean_name: boolean; created_at: string };
type Settings = { id: number; default_whatsapp: string | null; default_message: string | null; webhook_url: string | null };

function AdminPage() {
  const { session, isAdmin, loading, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [pwOpen, setPwOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!isAdmin) return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md rounded-2xl bg-card p-8 text-center shadow-elegant">
        <h1 className="text-xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sua conta não tem permissão de admin.</p>
        <Button className="mt-4" onClick={signOut}>Sair</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Building2 className="h-5 w-5" /></div>
            <span className="font-bold">Meu Apê Agora — Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="outline" size="sm">Ver site</Button></Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[160px] truncate">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPwOpen(true)}>
                  <KeyRound className="mr-2 h-4 w-4" /> Alterar senha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUserOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Criar novo usuário
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      <CreateUserDialog open={userOpen} onOpenChange={setUserOpen} />


      <main className="mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="properties">Empreendimentos</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns" className="mt-6"><CampaignsTab /></TabsContent>
          <TabsContent value="properties" className="mt-6"><PropertiesTab /></TabsContent>
          <TabsContent value="leads" className="mt-6"><LeadsTab /></TabsContent>
          <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* -------- CAMPANHAS -------- */
function CampaignsTab() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("feirao_campaigns").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Campaign[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  function newCampaign() {
    setEditing({ id: "", slug: "", name: "", hero_title: "Realize o sonho do seu apê", hero_subtitle: "Condições especiais com entrada facilitada", cta_text: "Quero aproveitar agora", primary_color: "#16a34a", accent_color: "#f97316", banner_url: null, whatsapp_number: null, whatsapp_message: "Olá! Tenho interesse.", active: true, popup_enabled: true, popup_delay_mobile: 5, popup_delay_desktop: 7, popup_frequency_hours: 24, popup_title: "Quer receber fotos e vídeos dos apartamentos disponíveis?", popup_subtitle: "Te envio agora no WhatsApp as melhores opções com entrada parcelada.", popup_button_text: "Quero receber agora", popup_whatsapp_message: "Olá, quero receber fotos e vídeos dos apartamentos com entrada parcelada" });
    setOpen(true);
  }

  async function save() {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.name.trim()) { toast.error("Slug e nome são obrigatórios"); return; }
    const slug = editing.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const payload = { ...editing, slug };
    const { id, ...data } = payload;
    const res = id ? await supabase.from("feirao_campaigns").update(data).eq("id", id) : await supabase.from("feirao_campaigns").insert(data);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Campanha salva");
    setOpen(false); load();
  }

  async function duplicate(c: Campaign) {
    const { id, slug, ...rest } = c;
    const newSlug = `${slug}-copia-${Date.now().toString(36).slice(-4)}`;
    const { error } = await supabase.from("feirao_campaigns").insert({ ...rest, slug: newSlug, name: `${c.name} (cópia)` });
    if (error) toast.error(error.message); else { toast.success("Duplicada"); load(); }
  }
  async function del(id: string) {
    if (!confirm("Excluir esta campanha?")) return;
    const { error } = await supabase.from("feirao_campaigns").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluída"); load(); }
  }
  async function toggle(c: Campaign) {
    const { error } = await supabase.from("feirao_campaigns").update({ active: !c.active }).eq("id", c.id);
    if (error) toast.error(error.message); else load();
  }

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-bold">Campanhas</h2>
        <Button variant="hero" onClick={newCampaign}><Plus className="mr-1.5 h-4 w-4" />Nova campanha</Button>
      </div>
      <div className="grid gap-3">
        {items.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{c.name}</h3>
                {c.active ? <Badge className="bg-success text-success-foreground">Ativa</Badge> : <Badge variant="secondary">Inativa</Badge>}
              </div>
              <p className="truncate text-sm text-muted-foreground">/c/{c.slug}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Switch checked={c.active} onCheckedChange={() => toggle(c)} />
              <Link to="/c/$slug" params={{ slug: c.slug }} target="_blank"><Button size="sm" variant="outline"><ExternalLink className="h-4 w-4" /></Button></Link>
              <Button size="sm" variant="outline" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => duplicate(c)}><Copy className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => del(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">Nenhuma campanha. Crie a primeira!</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar campanha" : "Nova campanha"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Slug (URL)</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="feirao-mrv" /></div>
              </div>
              <div><Label>Título do hero</Label><Input value={editing.hero_title} onChange={(e) => setEditing({ ...editing, hero_title: e.target.value })} /></div>
              <div><Label>Subtítulo</Label><Textarea value={editing.hero_subtitle} onChange={(e) => setEditing({ ...editing, hero_subtitle: e.target.value })} /></div>
              <div><Label>Texto do botão CTA</Label><Input value={editing.cta_text} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} /></div>
              <div><Label>URL do banner (opcional)</Label><Input value={editing.banner_url ?? ""} onChange={(e) => setEditing({ ...editing, banner_url: e.target.value || null })} placeholder="https://..." /></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>WhatsApp (com DDD)</Label><Input value={editing.whatsapp_number ?? ""} onChange={(e) => setEditing({ ...editing, whatsapp_number: e.target.value || null })} placeholder="5511900000000" /></div>
                <div><Label>Mensagem WhatsApp</Label><Input value={editing.whatsapp_message ?? ""} onChange={(e) => setEditing({ ...editing, whatsapp_message: e.target.value || null })} /></div>
              </div>

              <div className="rounded-2xl border border-dashed bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Pop-up de captura</h4>
                    <p className="text-xs text-muted-foreground">Aparece para quem está prestes a sair sem preencher.</p>
                  </div>
                  <Switch checked={editing.popup_enabled} onCheckedChange={(v) => setEditing({ ...editing, popup_enabled: v })} />
                </div>
                {editing.popup_enabled && (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div><Label>Delay mobile (s)</Label><Input type="number" min={1} value={editing.popup_delay_mobile} onChange={(e) => setEditing({ ...editing, popup_delay_mobile: parseInt(e.target.value || "5", 10) })} /></div>
                      <div><Label>Delay desktop (s)</Label><Input type="number" min={1} value={editing.popup_delay_desktop} onChange={(e) => setEditing({ ...editing, popup_delay_desktop: parseInt(e.target.value || "7", 10) })} /></div>
                      <div><Label>Frequência (horas)</Label><Input type="number" min={1} value={editing.popup_frequency_hours} onChange={(e) => setEditing({ ...editing, popup_frequency_hours: parseInt(e.target.value || "24", 10) })} /></div>
                    </div>
                    <div><Label>Título do pop-up</Label><Input value={editing.popup_title} onChange={(e) => setEditing({ ...editing, popup_title: e.target.value })} /></div>
                    <div><Label>Subtítulo</Label><Textarea value={editing.popup_subtitle} onChange={(e) => setEditing({ ...editing, popup_subtitle: e.target.value })} /></div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div><Label>Texto do botão</Label><Input value={editing.popup_button_text} onChange={(e) => setEditing({ ...editing, popup_button_text: e.target.value })} /></div>
                      <div><Label>Mensagem WhatsApp (pop-up)</Label><Input value={editing.popup_whatsapp_message} onChange={(e) => setEditing({ ...editing, popup_whatsapp_message: e.target.value })} /></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter><Button variant="hero" onClick={save}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------- EMPREENDIMENTOS -------- */
function PropertiesTab() {
  const [items, setItems] = useState<Property[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editing, setEditing] = useState<Property | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase.from("feirao_properties").select("*").order("display_order", { ascending: true }),
      supabase.from("feirao_campaigns").select("*").order("name"),
    ]);
    setItems((p.data ?? []) as Property[]);
    setCampaigns((c.data ?? []) as Campaign[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  function novo() {
    if (campaigns.length === 0) { toast.error("Crie uma campanha primeiro"); return; }
    setEditing({ id: "", campaign_id: campaigns[0].id, name: "", location: "", image_url: null, entry_value: null, description: null, tag: null, active: true });
    setOpen(true);
  }

  async function save() {
    if (!editing) return;
    const { id, ...data } = editing;
    const res = id ? await supabase.from("feirao_properties").update(data).eq("id", id) : await supabase.from("feirao_properties").insert(data);
    if (res.error) toast.error(res.error.message); else { toast.success("Salvo"); setOpen(false); load(); }
  }

  async function del(id: string) {
    if (!confirm("Excluir?")) return;
    const { error } = await supabase.from("feirao_properties").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !editing) return;
    setUploading(true);
    const files = Array.from(e.target.files);

    // Parse existing gallery from JSON
    let currentGallery: string[] = [];
    if (editing.image_url) {
      try {
        const parsed = JSON.parse(editing.image_url);
        if (Array.isArray(parsed)) currentGallery = parsed;
        else currentGallery = [editing.image_url];
      } catch (err) {
        currentGallery = [editing.image_url];
      }
    }

    const newUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("feirao_images").upload(filename, file);
      if (error) {
        toast.error(`Erro ao subir ${file.name}: ${error.message}`);
        continue;
      }
      const { data: pubData } = supabase.storage.from("feirao_images").getPublicUrl(filename);
      newUrls.push(pubData.publicUrl);
    }

    const finalGallery = [...currentGallery, ...newUrls];
    setEditing({ ...editing, image_url: JSON.stringify(finalGallery) });
    setUploading(false);
  }

  function removeImage(indexToRemove: number) {
    if (!editing || !editing.image_url) return;
    try {
      const parsed = JSON.parse(editing.image_url);
      if (Array.isArray(parsed)) {
        const updated = parsed.filter((_, i) => i !== indexToRemove);
        setEditing({ ...editing, image_url: updated.length > 0 ? JSON.stringify(updated) : null });
      } else {
        setEditing({ ...editing, image_url: null });
      }
    } catch {
      setEditing({ ...editing, image_url: null });
    }
  }

  // Helper to safely render images in admin
  const getGalleryUrls = (urlStr: string | null): string[] => {
    if (!urlStr) return [];
    try {
      const parsed = JSON.parse(urlStr);
      return Array.isArray(parsed) ? parsed : [urlStr];
    } catch {
      return [urlStr];
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-bold">Empreendimentos</h2>
        <Button variant="hero" onClick={novo}><Plus className="mr-1.5 h-4 w-4" />Novo</Button>
      </div>
      <div className="grid gap-3">
        {items.map((p) => {
          const camp = campaigns.find((c) => c.id === p.campaign_id);
          const gallery = getGalleryUrls(p.image_url);
          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.location} · {camp?.name ?? "—"} · Entrada {formatCurrencyBRL(p.entry_value)} · {gallery.length} fotos</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="rounded-2xl border-2 border-dashed p-10 text-center text-muted-foreground">Nenhum empreendimento.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo empreendimento"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div><Label>Campanha</Label>
                <Select value={editing.campaign_id} onValueChange={(v) => setEditing({ ...editing, campaign_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Localização</Label><Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Valor da entrada</Label><Input type="number" step="0.01" value={editing.entry_value ?? ""} onChange={(e) => setEditing({ ...editing, entry_value: e.target.value ? parseFloat(e.target.value) : null })} /></div>
                <div>
                  <Label>Tag (Fase da Obra)</Label>
                  <Select value={editing.tag ?? "none"} onValueChange={(v) => setEditing({ ...editing, tag: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue placeholder="Sem tag" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem tag</SelectItem>
                      <SelectItem value="Pré-Lançamento">Pré-Lançamento</SelectItem>
                      <SelectItem value="Lançamento">Lançamento</SelectItem>
                      <SelectItem value="Em Construção">Em Construção</SelectItem>
                      <SelectItem value="Fase de obra em 90%">Fase de obra em 90%</SelectItem>
                      <SelectItem value="Últimas Unidades">Últimas Unidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Descrição</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value || null })} /></div>

              <div className="rounded-xl border border-dashed p-4">
                <Label>Galeria de Fotos</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {getGalleryUrls(editing.image_url).map((url, i) => (
                    <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 rounded-md bg-destructive/90 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <Label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 hover:bg-muted/50">
                    {uploading ? <span className="text-xs">Enviando...</span> : <><Plus className="mb-1 h-5 w-5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Adicionar</span></>}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                  </Label>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Obs: O bucket "images" precisa ser criado e marcado como público no Supabase para os uploads funcionarem.</p>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="hero" onClick={save}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------- LEADS -------- */
function LeadsTab() {
  const [items, setItems] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    supabase.from("feirao_campaigns").select("*").order("name").then(({ data }) => setCampaigns((data ?? []) as Campaign[]));
  }, []);
  useEffect(() => {
    let q = supabase.from("feirao_leads").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("campaign_id", filter);
    q.then(({ data }) => setItems((data ?? []) as Lead[]));
  }, [filter]);

  function exportCSV() {
    const header = ["Data", "Nome", "WhatsApp", "Renda", "Faixa", "Valor Entrada", "Data Nasc", "Tipo Renda", "Junta Renda?", "Tem FGTS?", "Nome Limpo?", "Campanha", "Origem"];
    const rows = items.map((l) => [
      new Date(l.created_at).toLocaleString("pt-BR"),
      l.name, l.whatsapp, l.income_range,
      l.mcmv_faixa ?? "", l.entry_value ?? "", l.birth_date ? new Date(l.birth_date).toLocaleDateString("pt-BR") : "",
      l.income_type ?? "", l.joins_income ? "Sim" : "Não", l.has_fgts ? "Sim" : "Não", l.clean_name ? "Sim" : "Não",
      campaigns.find((c) => c.id === l.campaign_id)?.name ?? "",
      l.income_range === "Pop-up (não informado)" ? "Pop-up" : "Formulário Principal"
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const formLeads = items.filter(l => l.income_range !== "Pop-up (não informado)");
  const popupLeads = items.filter(l => l.income_range === "Pop-up (não informado)");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Leads <span className="text-sm font-normal text-muted-foreground">({items.length} no total)</span></h2>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as campanhas</SelectItem>
              {campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}><Download className="mr-1.5 h-4 w-4" />Exportar CSV</Button>
        </div>
      </div>

      {/* Tabela Formulário Principal */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          📋 Formulário Principal <Badge variant="secondary">{formLeads.length}</Badge>
        </h3>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Nome</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Renda / Faixa</th>
                <th className="p-3">Valor Entrada</th>
                <th className="p-3">Data Nasc.</th>
                <th className="p-3">Vínculo</th>
                <th className="p-3">Junta / FGTS / Nome Limpo</th>
                <th className="p-3">Campanha</th>
              </tr>
            </thead>
            <tbody>
              {formLeads.map((l) => (
                <tr key={l.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 font-bold">{l.name}</td>
                  <td className="p-3 font-medium text-primary">
                    <div className="flex items-center gap-2">
                      <span>{l.whatsapp}</span>
                      <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, '').length <= 11 ? '55' + l.whatsapp.replace(/\D/g, '') : l.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${l.name}! Recebi seu contato através da campanha ${campaigns.find((c) => c.id === l.campaign_id)?.name ?? "do site"}. Como posso te ajudar?`)}`} target="_blank" rel="noopener">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-full text-green-600 border-green-600/30 hover:bg-green-50" title="Falar no WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span>{l.income_range}</span>
                      {l.mcmv_faixa && <Badge variant="outline" className="w-fit border-primary/30 text-xs">Faixa {l.mcmv_faixa}</Badge>}
                    </div>
                  </td>
                  <td className="p-3">{l.uses_entry_value && l.entry_value ? formatCurrencyBRL(l.entry_value) : "—"}</td>
                  <td className="p-3">{l.birth_date ? new Date(l.birth_date).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—"}</td>
                  <td className="p-3">{l.income_type ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <Badge variant={l.joins_income ? "default" : "secondary"} className={l.joins_income ? "bg-success hover:bg-success" : ""}>Junta</Badge>
                      <Badge variant={l.has_fgts ? "default" : "secondary"} className={l.has_fgts ? "bg-success hover:bg-success" : ""}>FGTS</Badge>
                      <Badge variant={l.clean_name ? "default" : "destructive"}>Limpo</Badge>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{campaigns.find((c) => c.id === l.campaign_id)?.name ?? "—"}</td>
                </tr>
              ))}
              {formLeads.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Nenhum lead do formulário.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela Pop-up */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          ⚡ Pop-up de Captura Rápida <Badge variant="secondary">{popupLeads.length}</Badge>
        </h3>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 w-[150px]">Data</th>
                <th className="p-3">Nome</th>
                <th className="p-3 w-[200px]">WhatsApp</th>
                <th className="p-3">Campanha</th>
              </tr>
            </thead>
            <tbody>
              {popupLeads.map((l) => (
                <tr key={l.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 font-bold">{l.name}</td>
                  <td className="p-3 font-medium text-primary">
                    <div className="flex items-center gap-2">
                      <span>{l.whatsapp}</span>
                      <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, '').length <= 11 ? '55' + l.whatsapp.replace(/\D/g, '') : l.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${l.name}! Recebi seu contato através da campanha ${campaigns.find((c) => c.id === l.campaign_id)?.name ?? "do site"}. Como posso te ajudar?`)}`} target="_blank" rel="noopener">
                        <Button size="icon" variant="outline" className="h-7 w-7 rounded-full text-green-600 border-green-600/30 hover:bg-green-50" title="Falar no WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{campaigns.find((c) => c.id === l.campaign_id)?.name ?? "—"}</td>
                </tr>
              ))}
              {popupLeads.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">Nenhum lead de pop-up.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

/* -------- SETTINGS -------- */
function SettingsTab() {
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => {
    supabase.from("feirao_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setS(data as Settings));
  }, []);

  async function save() {
    if (!s) return;
    const { error } = await supabase.from("feirao_settings").update({
      default_whatsapp: s.default_whatsapp, default_message: s.default_message, webhook_url: s.webhook_url,
    }).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Configurações salvas");
  }

  if (!s) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-bold">Configurações globais</h2>
      <div><Label>WhatsApp padrão (com DDI)</Label><Input value={s.default_whatsapp ?? ""} onChange={(e) => setS({ ...s, default_whatsapp: e.target.value })} placeholder="5511900000000" /></div>
      <div><Label>Mensagem padrão</Label><Textarea value={s.default_message ?? ""} onChange={(e) => setS({ ...s, default_message: e.target.value })} /></div>
      <div><Label>Webhook URL (CRM)</Label><Input value={s.webhook_url ?? ""} onChange={(e) => setS({ ...s, webhook_url: e.target.value })} placeholder="https://seu-crm.com/webhook" /><p className="mt-1 text-xs text-muted-foreground">Recebe POST com {`{ event, lead }`} a cada novo lead.</p></div>
      <Button variant="hero" onClick={save}>Salvar</Button>
    </div>
  );
}

/* -------- DIALOGS DE PERFIL -------- */
function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Senha deve ter ao menos 6 caracteres"); return; }
    if (password !== confirm) { toast.error("As senhas não coincidem"); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha alterada com sucesso");
    setPassword(""); setConfirm("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Alterar minha senha</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Nova senha</Label><Input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div><Label>Confirmar nova senha</Label><Input type="password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          <DialogFooter><Button type="submit" variant="hero" disabled={submitting}>{submitting ? "Salvando..." : "Salvar nova senha"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("admin");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: { email, password, role },
    });
    setSubmitting(false);
    if (error || (data && (data as { error?: string }).error)) {
      toast.error(((data as { error?: string })?.error) ?? error?.message ?? "Falha ao criar usuário");
      return;
    }
    toast.success(`Usuário criado: ${email}`);
    setEmail(""); setPassword(""); setRole("admin");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Criar novo usuário</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>E-mail</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="socialmedia@empresa.com" /></div>
          <div><Label>Senha provisória (mín. 6)</Label><Input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div>
            <Label>Permissão</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "user")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (acesso total)</SelectItem>
                <SelectItem value="user">Usuário comum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">A conta será criada já confirmada. Compartilhe o e-mail e a senha com a pessoa.</p>
          <DialogFooter><Button type="submit" variant="hero" disabled={submitting}>{submitting ? "Criando..." : "Criar usuário"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

