import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import heroBuilding from "@/assets/hero-ville-de-lisboa.webp";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">A campanha que você procura pode ter sido movida ou desativada.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Meu Apê Agora — Realize o sonho do imóvel próprio" },
      { name: "description", content: "Plataforma de hotsites para campanhas imobiliárias com classificação automática de faixa MCMV." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preload", as: "image", href: heroBuilding, fetchPriority: "high" }
    ],
    scripts: [],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TCHGV49H"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { useEffect } from "react";

function RootComponent() {
  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined" && !(window as any).gtmLoaded) {
      const loadGTM = () => {
        if ((window as any).gtmLoaded) return;
        (window as any).gtmLoaded = true;
        
        // Google Ads
        const script1 = document.createElement("script");
        script1.src = "https://www.googletagmanager.com/gtag/js?id=AW-988166206";
        script1.async = true;
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'AW-988166206');`;
        document.head.appendChild(script2);

        // GTM
        const script3 = document.createElement("script");
        script3.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-TCHGV49H');`;
        document.head.appendChild(script3);
      };

      // Load after 3 seconds or on first interaction, whichever comes first
      const timer = setTimeout(loadGTM, 3500);
      const onInteract = () => { loadGTM(); clearTimeout(timer); };
      ['scroll', 'mousemove', 'touchstart', 'click'].forEach(e => 
        window.addEventListener(e, onInteract, { once: true, passive: true })
      );
    }
  }, []);

  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}
