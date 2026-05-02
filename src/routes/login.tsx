import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/admin" });
  }, [loading, session, navigate]);

  async function handle(action: "in" | "up", e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = action === "in" ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
    if (error) { toast.error(error); return; }
    if (action === "up") toast.success("Conta criada! Verifique seu e-mail se necessário.");
    else navigate({ to: "/admin" });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Enviamos um link de recuperação para seu e-mail.");
    setForgotOpen(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft p-4">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-elegant">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"><Building2 className="h-5 w-5" /></div>
          <span className="font-bold">Apê Fácil</span>
        </Link>
        <h1 className="text-2xl font-bold">Painel administrativo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesse para gerenciar suas campanhas.</p>

        <Tabs defaultValue="in" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="in">Entrar</TabsTrigger>
            <TabsTrigger value="up">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="in">
            <form onSubmit={(e) => handle("in", e)} className="space-y-4 pt-4">
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Senha</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</Button>
              <button
                type="button"
                onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                className="block w-full text-center text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </form>
          </TabsContent>
          <TabsContent value="up">
            <form onSubmit={(e) => handle("up", e)} className="space-y-4 pt-4">
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Senha (mín. 6)</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>{submitting ? "Criando..." : "Criar conta"}</Button>
              <p className="text-xs text-muted-foreground">A primeira conta criada vira admin automaticamente.</p>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={forgotSubmitting}>
              {forgotSubmitting ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
