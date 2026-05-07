import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ArrowRight, ExternalLink } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type Campaign = {
  id: string;
  slug: string;
  name: string;
  hero_title: string;
  banner_url: string | null;
};

function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Aqui você pode editar os textos e imagens dos projetos externos (que não estão no Supabase)
  const externalProjects = [
    {
      id: "topville",
      title: "Topville Catu",
      description: "TopVille Catu é a combinação perfeita entre lazer, conforto e alto potencial de valorização em Aquiraz, a poucos minutos do Beach Park.",
      image: "/src/assets/hero-building-topville.jpg",
      // Se quiser trocar a foto, cole a URL entre aspas, ex: "https://site.com/foto.jpg"
      link: "topville-catu/",
      buttonText: "Acessar portal"
    }
  ];

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("feirao_campaigns")
        .select("id,slug,name,hero_title,banner_url")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setCampaigns(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* HEADER SIMPLES */}
      <header className="border-b bg-card py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="ml-3 text-xl font-bold tracking-tight text-foreground">Meu Apê Agora</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Encontre o <span className="text-primary">imóvel dos seus sonhos</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore feirões de apartamentos e oportunidades em loteamentos com condições especiais, ideais tanto para morar quanto para investir.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {/* PROJETOS EXTERNOS (ex: Topville) */}
            {externalProjects.map((proj) => (
              <a
                key={proj.id}
                href={proj.link}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{proj.title}</h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="text-sm text-muted-foreground">
                    {proj.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-sm font-semibold text-primary">
                    <span>{proj.buttonText}</span>
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </a>
            ))}

            {/* CAMPANHAS DO SISTEMA */}
            {campaigns.map((camp) => (
              <Link
                key={camp.id}
                to="/$slug"
                params={{ slug: camp.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {camp.banner_url?.toLowerCase().match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || camp.banner_url?.includes('.mp4') ? (
                    <video
                      src={camp.banner_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={camp.banner_url || heroBuilding}
                      alt={camp.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{camp.name}</h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {camp.hero_title}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-sm font-semibold text-primary">
                    <span>Ver campanha</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Meu Apê Agora. Todos os direitos reservados.
      </footer>
    </div>
  );
}
