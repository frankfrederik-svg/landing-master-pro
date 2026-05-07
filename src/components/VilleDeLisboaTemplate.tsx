import { useState, useEffect } from "react";
import { HotsiteForm } from "./HotsiteForm";
import { resolveImage } from "@/lib/faixa";
import { Wallet, Handshake, Landmark, TrendingDown, MessageCircle, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

type Campaign = {
  id: string; slug: string; name: string;
  hero_title: string; hero_subtitle: string; cta_text: string;
  banner_url: string | null;
  whatsapp_number: string | null; whatsapp_message: string | null;
  [key: string]: any;
};

type Property = {
  id: string; name: string; location: string; image_url: string | null;
  entry_value: number | null; description: string | null; tag: string | null;
};

export function VilleDeLisboaTemplate({ campaign, properties }: { campaign: Campaign; properties: Property[] }) {
  const scrollToForm = () => document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });

  const heroDesktop = campaign.banner_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBueCwgJ97yJn2N2uZcVoKVXI1UGZT0D54Bn7JpIL0A8IX2CFEtCK3twYewgbNT5qhk3gGjJBKaaNAqJRqsIFzwXlcUFEgOp2RYZw0xSXBagAqG4DziccCi8H7MI7Hxcrbgsf_Q7k_u1otNOw1kuWpPkFEODmyojSIYNbId3oHqaH_b1ktFY_3e6oaejQiVy7zlvH3RpwwuYVxUdgG6y3z3w-Tb5k_KTn256CHLudAw-dFMqG3_wOcvdxKjXRScyuTi66TwVeVhya8";
  const heroMobile = campaign.layout_data?.banner_mobile || heroDesktop;

  // Floating CTA visibility
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const formElement = document.getElementById("formulario");
      let isFormVisible = false;
      if (formElement) {
        const rect = formElement.getBoundingClientRect();
        isFormVisible = rect.top < window.innerHeight;
      }
      setShowFloatingCTA(window.scrollY > 400 && !isFormVisible);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gallery
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Prova Social Counter (Atualiza 1 por hora)
  const [baseCount, setBaseCount] = useState(62);
  const [reservasCount, setReservasCount] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem('ville_reservations');
    const lastUpdate = localStorage.getItem('ville_last_update');
    const now = Date.now();
    let currentBase = 62;
    
    if (stored && lastUpdate) {
      const hoursPassed = Math.floor((now - parseInt(lastUpdate)) / (1000 * 60 * 60));
      if (hoursPassed > 0) {
        currentBase = parseInt(stored) + hoursPassed;
        localStorage.setItem('ville_reservations', currentBase.toString());
        localStorage.setItem('ville_last_update', now.toString());
      } else {
        currentBase = parseInt(stored);
      }
    } else {
      localStorage.setItem('ville_reservations', '62');
      localStorage.setItem('ville_last_update', now.toString());
    }
    
    setBaseCount(currentBase);

    const hourInterval = setInterval(() => {
      setBaseCount(prev => {
        const next = prev + 1;
        localStorage.setItem('ville_reservations', next.toString());
        localStorage.setItem('ville_last_update', Date.now().toString());
        return next;
      });
    }, 1000 * 60 * 60);

    return () => clearInterval(hourInterval);
  }, []);

  // Animação inicial
  useEffect(() => {
    let current = reservasCount === 1 ? 1 : reservasCount;
    const interval = setInterval(() => {
      setReservasCount(prev => {
        if (prev < baseCount) {
          const next = prev + Math.floor(Math.random() * 5) + 2;
          return next > baseCount ? baseCount : next;
        }
        clearInterval(interval);
        return prev;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [baseCount]);

  // Extrai imagens dos empreendimentos para a galeria ou usa imagens padrão
  const propertyImages = properties.flatMap(p => {
    if (!p.image_url) return [];
    try {
      const parsed = JSON.parse(p.image_url);
      return Array.isArray(parsed) ? parsed : [p.image_url];
    } catch {
      return [p.image_url];
    }
  }).slice(0, 5).map(u => resolveImage(u));

  const galleryImages = propertyImages.length > 0 ? propertyImages : [
    hero,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAflQ94r17rQ6B8qPdBUzXMGtBjrrObuCedd1aB2riFFLJqq6P4fL0oL6zQLZ5_1rr_w1RGOMGXp9KABRtG26n5Pm7LcSch-wl1rtw06Hl1VvE9L2K3w40fIOQ8MPM7GPxlnxv37jCWA1LsjOjUr79TceKoyJFjo_hFJ5fikTwK19lvx6hpJA_bNssP7UrAbDer6uB4IKOMVX88IX09GQ-w0h_iwm7GiesvUVhhlH3tsj8xPk_MPE_PHmIU-fxs8IBvhSfz-W5EBwo",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAyTveLNCkexo8X-DzC53w_UE4bXdVvnggsMi3SBcMn69p2N2DWg4Jg9Bp7_PoZWuz319QeG-P1zkNxv6-DP5KI7vRSZuVctkSFMFhXtFwVovt6I6ib-SzoaFDDDHB_pMzRnIe_oCweBbwBeTMhQf6FFG2eZLgHKp5PN6ZrObIzlTjScBe0f4H-5xeyCeNZkvLaKndq_JSaqIW3kql6oohkSdxrvq4Qpel-OHqBlmYb3tGVAtFetDp0ZNNWdAZoLOk-QRccn3hR6Ug"
  ];

  // Swipe e Navegação da Galeria
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEndAction = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setGalleryIndex(i => (i + 1) % galleryImages.length);
    } else if (distance < -50) {
      setGalleryIndex(i => (i - 1 + galleryImages.length) % galleryImages.length);
    }
  }

  const prevSlide = () => setGalleryIndex(i => (i - 1 + galleryImages.length) % galleryImages.length);
  const nextSlide = () => setGalleryIndex(i => (i + 1) % galleryImages.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setGalleryIndex(i => (i + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  return (
    <div className="bg-[#f9f9ff] text-[#121c2c] font-sans overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f9f9ff]/95 backdrop-blur-md shadow-sm h-14 md:h-20 transition-all">
        <div className="flex justify-between items-center max-w-[1200px] mx-auto px-4 md:px-6 h-full gap-3">
          {campaign.layout_data?.logo ? (
            <img src={campaign.layout_data.logo} alt={campaign.name} className="h-8 md:h-14 w-auto object-contain max-w-[110px] md:max-w-none" />
          ) : (
            <span className="text-lg md:text-2xl font-bold text-[#794098] truncate">{campaign.name}</span>
          )}
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#794098] border-b-2 border-[#794098] pb-1 font-semibold transition-all duration-300" href="#localizacao">Localização</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#diferenciais">Diferenciais</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#beneficios">Benefícios</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#sobre">Sobre</a>
          </div>
          <button onClick={scrollToForm} className="bg-[#794098] text-white px-4 py-1.5 md:px-6 md:py-3 text-[12px] md:text-base rounded-full font-medium md:font-semibold hover:bg-[#8b4aae] transition-all duration-300 active:scale-95 whitespace-nowrap shadow-sm">
            Simular Agora
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-[100vh] md:min-h-[800px] pt-20 pb-12 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#121c2c] via-[#121c2c]/40 to-black/10 z-10 md:bg-gradient-to-r md:from-[#121c2c]/80 md:via-[#121c2c]/40 md:to-transparent"></div>
          
          {/* Mobile Video/Banner */}
          <div className="md:hidden w-full h-full">
            {heroMobile.toLowerCase().match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || heroMobile.includes('.mp4') ? (
              <video className="w-full h-full object-cover" src={heroMobile} autoPlay loop muted playsInline />
            ) : (
              <img className="w-full h-full object-cover" src={heroMobile} alt="Hero Background Mobile" />
            )}
          </div>

          {/* Desktop Video/Banner */}
          <div className="hidden md:block w-full h-full">
            {heroDesktop.toLowerCase().match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || heroDesktop.includes('.mp4') ? (
              <video className="w-full h-full object-cover" src={heroDesktop} autoPlay loop muted playsInline />
            ) : (
              <img className="w-full h-full object-cover" src={heroDesktop} alt="Hero Background Desktop" />
            )}
          </div>
        </div>
        <div className="relative z-20 max-w-[800px] mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center w-full pt-4 pb-16">
          <div className="text-white flex flex-col items-center w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-lg">
              Saia do aluguel com parcelas facilitadas em até 72x
            </h1>
            <p className="text-lg md:text-2xl mb-8 md:mb-10 text-[#f6fff4] font-light max-w-3xl drop-shadow-md">
              Apartamentos com lazer completo e possibilidade de subsídio de até R$55 mil pelo Minha Casa Minha Vida.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12 w-full max-w-4xl">
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all">
                <Wallet className="w-8 h-8 md:w-10 md:h-10 mb-3 text-[#e3c2f2] opacity-90" strokeWidth={1.5} />
                <span className="text-sm md:text-base font-medium leading-tight">Subsídio de<br/>até R$55 mil</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#794098] to-[#b971dc] rounded-2xl p-5 border border-[#e3c2f2]/40 shadow-[0_0_25px_rgba(185,113,220,0.6)] transform hover:scale-105 transition-all">
                <Handshake className="w-8 h-8 md:w-10 md:h-10 mb-3 text-white" strokeWidth={1.5} />
                <span className="text-sm md:text-base font-extrabold leading-tight">Entrada facilitada<br/>em até 72x</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all">
                <Landmark className="w-8 h-8 md:w-10 md:h-10 mb-3 text-[#e3c2f2] opacity-90" strokeWidth={1.5} />
                <span className="text-sm md:text-base font-medium leading-tight">Use seu<br/>FGTS</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all">
                <TrendingDown className="w-8 h-8 md:w-10 md:h-10 mb-3 text-[#e3c2f2] opacity-90" strokeWidth={1.5} />
                <span className="text-sm md:text-base font-medium leading-tight">Menores juros<br/>do mercado</span>
              </div>
            </div>

            <a 
              href={`https://wa.me/${campaign.whatsapp_number?.replace(/\D/g, "")}?text=${encodeURIComponent("Olá 👋 Tenho interesse no Ville de Lisboa e gostaria de fazer minha simulação pelo Minha Casa Minha Vida.")}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366] text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-base md:text-xl inline-flex items-center justify-center gap-3 w-full md:w-auto shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
              QUERO FAZER MINHA SIMULAÇÃO
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/80 z-20">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 font-medium">Saiba mais</span>
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </section>

      {/* Benefícios Section */}
      <section className="py-20 bg-[#f9f9ff]" id="beneficios">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <img src="\src\assets\ville-de-lisboa\logo-mcmv.png" alt="Minha Casa Minha Vida" className="h-16 object-contain mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[#794098] mb-4">Vantagens do Minha Casa Minha Vida</h2>
            <div className="h-1 w-20 bg-[#b971dc] mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#bdcabd]/30 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-[#794098]/10 flex items-center justify-center mb-6 text-2xl">💰</div>
              <h3 className="font-bold mb-2">Subsídio de até R$ 55 mil</h3>
              <p className="text-sm text-[#3e4a3f]">O governo ajuda você a pagar uma parte do seu imóvel.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#bdcabd]/30 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-[#455f88]/10 flex items-center justify-center mb-6 text-2xl">📉</div>
              <h3 className="font-bold mb-2">Juros reduzidos</h3>
              <p className="text-sm text-[#3e4a3f]">As menores taxas do mercado imobiliário para você.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#bdcabd]/30 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-[#794098]/10 flex items-center justify-center mb-6 text-2xl">🤝</div>
              <h3 className="font-bold mb-2">Facilidade na entrada</h3>
              <p className="text-sm text-[#3e4a3f]">A construtora parcela sua entrada em condições exclusivas.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#bdcabd]/30 flex flex-col items-center text-center transition-transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-[#455f88]/10 flex items-center justify-center mb-6 text-2xl">🏦</div>
              <h3 className="font-bold mb-2">Uso do FGTS</h3>
              <p className="text-sm text-[#3e4a3f]">Utilize o seu saldo do fundo de garantia no financiamento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Empreendimento */}
      <section className="py-20 bg-[#f0f3ff]" id="sobre">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={campaign.layout_data?.sobre1 || "https://lh3.googleusercontent.com/aida-public/AB6AXuAflQ94r17rQ6B8qPdBUzXMGtBjrrObuCedd1aB2riFFLJqq6P4fL0oL6zQLZ5_1rr_w1RGOMGXp9KABRtG26n5Pm7LcSch-wl1rtw06Hl1VvE9L2K3w40fIOQ8MPM7GPxlnxv37jCWA1LsjOjUr79TceKoyJFjo_hFJ5fikTwK19lvx6hpJA_bNssP7UrAbDer6uB4IKOMVX88IX09GQ-w0h_iwm7GiesvUVhhlH3tsj8xPk_MPE_PHmIU-fxs8IBvhSfz-W5EBwo"} alt="Sobre" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-xl overflow-hidden shadow-2xl border-4 border-white hidden md:block">
              <img className="w-full h-full object-cover" src={campaign.layout_data?.sobre2 || "https://lh3.googleusercontent.com/aida-public/AB6AXuDU-bgeFUwXI0tb496RgLapp854IY1uJoDcbHCl6_WTOvVrz9YtWCBlI1SZWrI8oskYXd5frm6h4QrsI4E02hkdN-Ng1guJvyN9AY6UDmJhc4aNsK7GbRIFY6ccHIzHF3ngR56jSsegDiyT-Xf8z77TEvRq5cfsu_9C4qGhBLeQ0we69EuUPYJ5m4ZcPK6bKTw7N2dcuA01a5kXjcg521A-zJuqtyfB84KoMNIiyvRiQuFr4s8b9utTcSo8WGCGfT9Pj3fC00qO5kc"} alt="Parque" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#794098] mb-6">{campaign.name}</h2>
            <p className="text-lg text-[#3e4a3f] mb-8 leading-relaxed">
              Um empreendimento pensado para quem quer sair do aluguel com qualidade de vida, segurança e lazer completo. Une modernidade e praticidade para sua família.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="flex items-center justify-center w-12 h-12 text-[#794098] bg-[#794098]/10 rounded-lg text-2xl">🏢</span>
                <div>
                  <h4 className="font-bold">Apartamentos Modernos</h4>
                  <p className="text-sm text-[#3e4a3f]">Plantas inteligentes para o máximo aproveitamento de espaço.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center justify-center w-12 h-12 text-[#794098] bg-[#794098]/10 rounded-lg text-2xl">🏊‍♂️</span>
                <div>
                  <h4 className="font-bold">Lazer de Clube</h4>
                  <p className="text-sm text-[#3e4a3f]">Piscina, playground, salão de festas e muito mais.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section className="py-20 bg-[#f9f9ff]" id="galeria">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#794098] mb-4">Galeria do Empreendimento</h2>
            <div className="h-1 w-20 bg-[#b971dc] mx-auto rounded-full"></div>
          </div>
          <div className="relative group max-w-5xl mx-auto">
            <div 
              className="flex overflow-hidden rounded-xl shadow-2xl aspect-[16/9] relative"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEndAction}
            >
              <img src={galleryImages[galleryIndex] as string} className="w-full h-full object-cover transition-opacity duration-500" alt="Galeria" />
              
              <button 
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 md:flex hidden items-center justify-center"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 md:flex hidden items-center justify-center"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {galleryImages.map((_, i) => (
                <button key={i} onClick={() => setGalleryIndex(i)} className={`h-2.5 rounded-full transition-all duration-300 ${i === galleryIndex ? 'w-6 bg-[#794098]' : 'w-2.5 bg-[#bdcabd]'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-white" id="diferenciais">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-[#8b4aae] p-12 rounded-3xl text-[#f6fff4]">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-8">Por que escolher o {campaign.name}?</h2>
                <ul className="space-y-6">
                  <li className="flex items-center gap-4">
                    <span className="bg-white/20 p-2 rounded-full">✓</span>
                    <span className="text-lg">Condomínio fechado com portaria 24h</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="bg-white/20 p-2 rounded-full">✓</span>
                    <span className="text-lg">Área de lazer completa e equipada</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="bg-white/20 p-2 rounded-full">✓</span>
                    <span className="text-lg">Segurança para toda a sua família</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="bg-white/20 p-2 rounded-full">✓</span>
                    <span className="text-lg">Localização estratégica</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="bg-white/20 p-2 rounded-full">✓</span>
                    <span className="text-lg">Excelente potencial de valorização</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-40 rounded-2xl overflow-hidden">
                    <img className="w-full h-full object-cover" src={campaign.layout_data?.dif1 || "https://lh3.googleusercontent.com/aida-public/AB6AXuAyTveLNCkexo8X-DzC53w_UE4bXdVvnggsMi3SBcMn69p2N2DWg4Jg9Bp7_PoZWuz319QeG-P1zkNxv6-DP5KI7vRSZuVctkSFMFhXtFwVovt6I6ib-SzoaFDDDHB_pMzRnIe_oCweBbwBeTMhQf6FFG2eZLgHKp5PN6ZrObIzlTjScBe0f4H-5xeyCeNZkvLaKndq_JSaqIW3kql6oohkSdxrvq4Qpel-OHqBlmYb3tGVAtFetDp0ZNNWdAZoLOk-QRccn3hR6Ug"} alt="Gourmet" />
                  </div>
                  <div className="h-56 rounded-2xl overflow-hidden">
                    <img className="w-full h-full object-cover" src={campaign.layout_data?.dif2 || "https://lh3.googleusercontent.com/aida-public/AB6AXuADrjd4GWXV1xfELn9oRyaeAX0rGKlyHQ2qwXyJQP2_B4L4OeRvauFeGM4HWA1LIyZwZSATksrH59x4plxkjsNmkePqMud5QBSvLC0VpCsqq-hW-X_Y1YuyMhWsw8WL7cXD78BvKMQM3TrpBHAkIZ01CPzAGChuMhHvTuEMWxdldJveE0iOX-n7iUadvW4h83mBcDG2omxsX9F6NBI8e4AH9hBjFgfyqCubCIlDjkIkwxqatKXmwzLUqNN7aQGHoSOHXfAxgoWYdPg"} alt="Academia" />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-56 rounded-2xl overflow-hidden">
                    <img className="w-full h-full object-cover" src={campaign.layout_data?.dif3 || "https://lh3.googleusercontent.com/aida-public/AB6AXuDAlbpVqJboWlvLa8zZS488urEHzxpdiIeWnnR1TetChdeaaj8hfOxh4HNsvMDtacOdENHlceuiSFTLFMm_NFx_8qmC47VxBAhW1BJiCc358kEXxn3yTTviO-U2YFos2eee1VBJ4ERx03iXdZaMP48sZgTbT5dEFLt2AuofeXKxVyaKNVhLhb_4vuP3cOUvgdmV0ocdqu2hsOXoKUmlSaIo9RNZdQbvUjskwwf8fvR6ssgqgKKpUFvWdTLa1Zf13l4O6ohX3rxoJOg"} alt="Pista" />
                  </div>
                  <div className="h-40 rounded-2xl overflow-hidden">
                    <img className="w-full h-full object-cover" src={campaign.layout_data?.dif4 || "https://lh3.googleusercontent.com/aida-public/AB6AXuBvWAF_RzGUierBB_lXYuyKzh27A2oWhM59nVrLtuxeuy8kQdaXrzWbPRUxy5rg3gxxFjr3DPUUTlm2M_yMoisxsNzmqwzxuTOLCxSVssD2Qec112cIjTC_-2MDqLntd8lr4CoRpWkntDIuyZIj9fkwDC85F7w5VnER1L5eFsuHRf0WEqGCKoaXVd27NRIxae1ND97YMqiTUAmxT5tmXqndep9wLRptgN6pJzDUsUTK_vymLQzfreP5FmHXYXnZxRvs9Wqi58IWPI0"} alt="Lobby" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prova Social e Urgência */}
      <section className="py-20 bg-[#121c2c] text-white relative overflow-hidden">
        {/* Decorativo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#794098]/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            {/* Badges de Urgência */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Alta procura
              </span>
              <span className="bg-[#794098]/30 text-[#e3c2f2] border border-[#794098]/50 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                ⏱️ Últimas unidades desta etapa
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                ✨ Reservas recentes
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <span>Mais de</span>
              <span className="text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-[#b971dc] to-[#794098] drop-shadow-[0_0_15px_rgba(185,113,220,0.5)] tabular-nums">
                {reservasCount}
              </span>
              <span>famílias</span>
            </h2>
            
            <p className="text-xl md:text-3xl text-[#e3c2f2] max-w-3xl mx-auto font-light leading-relaxed">
              já realizaram a reserva da sua unidade. <br className="hidden md:block"/>
              <strong className="text-white font-semibold">Não fique de fora dessa oportunidade.</strong>
            </p>

            {/* Social Proof Avatars */}
            <div className="mt-12 flex flex-col items-center">
              <div className="flex -space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-[#121c2c] bg-[#455f88] flex items-center justify-center text-sm font-bold shadow-lg">AM</div>
                <div className="w-12 h-12 rounded-full border-2 border-[#121c2c] bg-[#8b4aae] flex items-center justify-center text-sm font-bold shadow-lg">JS</div>
                <div className="w-12 h-12 rounded-full border-2 border-[#121c2c] bg-emerald-600 flex items-center justify-center text-sm font-bold shadow-lg">MR</div>
                <div className="w-12 h-12 rounded-full border-2 border-[#121c2c] bg-[#e3c2f2] text-[#2c133a] flex items-center justify-center text-sm font-bold shadow-lg">LC</div>
                <div className="w-12 h-12 rounded-full border-2 border-[#121c2c] bg-[#794098] flex items-center justify-center text-sm font-bold shadow-lg">+{reservasCount > 4 ? reservasCount - 4 : 0}</div>
              </div>
              <p className="text-sm text-[#8b9fc1] font-medium tracking-wide">Pessoas reais realizando o sonho do primeiro imóvel</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Formulário Final */}
      <section id="formulario" className="py-24 bg-gradient-to-b from-[#f9f9ff] to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#794098]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#455f88]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-0 pointer-events-none"></div>
        <div className="max-w-[1000px] mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#121c2c] mb-6 leading-tight tracking-tight">
              Financie seu apê com <br className="hidden md:block" />
              <span className="block mt-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#794098] to-[#b971dc] drop-shadow-[0_5px_15px_rgba(121,64,152,0.25)]">
                entrada parcelada em até 72x
              </span>
            </h2>
            <p className="text-lg md:text-xl text-[#3e4a3f] max-w-3xl mx-auto">
              Preencha os dados abaixo e fale com um especialista para descobrir parcelas, possibilidade de subsídio e condições facilitadas.
            </p>
          </div>
          
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_rgba(69,95,136,0.12)] border border-[#bdcabd]/20 max-w-2xl mx-auto w-full relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#794098] to-[#b971dc] rounded-full opacity-10 blur-xl pointer-events-none"></div>
            
            <HotsiteForm 
              campaignId={campaign.id} 
              whatsappNumber={campaign.whatsapp_number} 
              whatsappMessage="Olá 👋 Acabei de preencher a simulação do Ville de Lisboa e gostaria de receber minhas condições de financiamento."
              buttonText="QUERO RECEBER MINHA SIMULAÇÃO"
            />
            <p className="mt-6 text-[13px] text-[#455f88] text-center font-medium">
              🔒 Suas informações estão seguras. Não enviamos spam.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#d9e3f9] border-t border-[#bdcabd]/30">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1200px] mx-auto px-6 py-12 gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            {campaign.layout_data?.logo ? (
              <img src={campaign.layout_data.logo} alt={campaign.name} className="h-16 object-contain grayscale opacity-70" />
            ) : (
              <span className="text-2xl font-bold text-[#794098] opacity-70">{campaign.name}</span>
            )}
            <p className="text-[#3f5882] text-center md:text-left max-w-xs mt-2">
              © {new Date().getFullYear()} {campaign.name}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA Mobile */}
      <div className={`md:hidden fixed bottom-6 left-0 right-0 px-4 z-50 transition-all duration-500 transform ${showFloatingCTA ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <a 
          href={`https://wa.me/${campaign.whatsapp_number?.replace(/\D/g, "")}?text=${encodeURIComponent("Olá 👋 Tenho interesse no Ville de Lisboa e gostaria de fazer minha simulação pelo Minha Casa Minha Vida.")}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-[#25D366] text-white w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(37,211,102,0.5)] border border-[#25D366]/50 hover:bg-[#20b858] transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          Simular pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
