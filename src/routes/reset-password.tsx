import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase coloca o token de recovery no hash da URL.
    // O onAuthStateChange dispara um evento PASSWORD_RECOVERY quando isso acontece.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Caso o evento já tenha disparado antes do mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { toast.error("As senhas não coincidem."); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha alterada com sucesso!");
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft p-4">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-elegant">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Building2 className="h-5 w-5" /></div>
          <span className="font-bold">Apê Fácil</span>
        </Link>
        <h1 className="text-2xl font-bold">Definir nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ready ? "Digite a nova senha para acessar o painel." : "Validando link de recuperação..."}
        </p>

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirmar nova senha</Label>
              <Input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-muted-foreground hover:text-foreground">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}
