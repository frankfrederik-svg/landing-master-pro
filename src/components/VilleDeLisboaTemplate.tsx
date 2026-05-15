import { useState, useEffect, useRef } from "react";
import { HotsiteForm } from "./HotsiteForm";
import { resolveImage } from "@/lib/faixa";
import { Wallet, Handshake, Landmark, TrendingDown, MessageCircle, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, MapPin, Building, Users, RotateCcw } from "lucide-react";
import heroFallbackImg from "@/assets/hero-ville-de-lisboa.jpg";

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
  const scrollToForm = () => {
    const el = document.getElementById("formulario");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const heroDesktop = campaign.banner_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop";
  const heroMobile = campaign.layout_data?.banner_mobile || heroDesktop;

  // Scrolling states
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [showRotateHint, setShowRotateHint] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const formElement = document.getElementById("formulario");
      let isFormVisible = false;
      if (formElement) {
        const rect = formElement.getBoundingClientRect();
        isFormVisible = rect.top < window.innerHeight && rect.bottom > 0;
      }
      setShowFloatingCTA(window.scrollY > 300 && !isFormVisible);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageRotation, setImageRotation] = useState(0);

  // Extrai imagens
  const propertyImages = properties.flatMap(p => {
    if (!p.image_url) return [];
    try {
      const parsed = JSON.parse(p.image_url);
      return Array.isArray(parsed) ? parsed : [p.image_url];
    } catch {
      return [p.image_url];
    }
  }).slice(0, 5).map(u => resolveImage(u));

  const campaignGallery = campaign.layout_data?.gallery && Array.isArray(campaign.layout_data.gallery) && campaign.layout_data.gallery.length > 0
    ? campaign.layout_data.gallery
    : null;

  const galleryImages = campaignGallery || (propertyImages.length > 0 ? propertyImages : [
    heroDesktop,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAflQ94r17rQ6B8qPdBUzXMGtBjrrObuCedd1aB2riFFLJqq6P4fL0oL6zQLZ5_1rr_w1RGOMGXp9KABRtG26n5Pm7LcSch-wl1rtw06Hl1VvE9L2K3w40fIOQ8MPM7GPxlnxv37jCWA1LsjOjUr79TceKoyJFjo_hFJ5fikTwK19lvx6hpJA_bNssP7UrAbDer6uB4IKOMVX88IX09GQ-w0h_iwm7GiesvUVhhlH3tsj8xPk_MPE_PHmIU-fxs8IBvhSfz-W5EBwo",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAyTveLNCkexo8X-DzC53w_UE4bXdVvnggsMi3SBcMn69p2N2DWg4Jg9Bp7_PoZWuz319QeG-P1zkNxv6-DP5KI7vRSZuVctkSFMFhXtFwVovt6I6ib-SzoaFDDDHB_pMzRnIe_oCweBbwBeTMhQf6FFG2eZLgHKp5PN6ZrObIzlTjScBe0f4H-5xeyCeNZkvLaKndq_JSaqIW3kql6oohkSdxrvq4Qpel-OHqBlmYb3tGVAtFetDp0ZNNWdAZoLOk-QRccn3hR6Ug"
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "ArrowRight") setSelectedImageIndex(i => (i! + 1) % galleryImages.length);
      if (e.key === "ArrowLeft") setSelectedImageIndex(i => (i! - 1 + galleryImages.length) % galleryImages.length);
      if (e.key === "Escape") setSelectedImageIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, galleryImages.length]);

  useEffect(() => {
    if (selectedImageIndex !== null) {
      setImageRotation(0);
      setShowRotateHint(true);
      const timer = setTimeout(() => setShowRotateHint(false), 4500);
      return () => clearTimeout(timer);
    } else {
      setShowRotateHint(false);
      setImageRotation(0);
    }
  }, [selectedImageIndex]);

  // Lightbox navigation handlers
  const touchStartX = useRef<number | null>(null);
  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null) setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
  };
  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedImageIndex !== null) setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length);
  };
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextImage(); else if (diff < -50) prevImage();
    touchStartX.current = null;
  };

  // Gallery swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = () => setGalleryIndex(i => (i + 1) % galleryImages.length);
  const prevSlide = () => setGalleryIndex(i => (i - 1 + galleryImages.length) % galleryImages.length);

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEndAction = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setGalleryIndex(i => (i + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const isVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || lower.includes('.mp4') || (lower.includes('supabase') && !lower.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/));
  };

  return (
    <div className="bg-[#f5f5f5] text-[#333] font-sans overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-sm py-2 md:py-3 border-b border-gray-100">
        <div className="flex justify-between items-center max-w-[1200px] mx-auto px-4 md:px-6 gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {campaign.layout_data?.logo ? (
              <img src={campaign.layout_data.logo} alt="MRV Logo" className="h-8 md:h-10 object-contain" />
            ) : (
              <span className="font-bold text-[#008A46] text-xl">MRV</span>
            )}
          </div>
          {/* CTA */}
          <a
            href={`https://wa.me/${campaign.whatsapp_number?.replace(/\D/g, "")}?text=${encodeURIComponent("Olá 👋 Tenho interesse no Ville de Lisboa.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).gtag) {
                (window as any).gtag('event', 'conversion', {'send_to': 'AW-988166206/tSVuCPz4la0cEL7wmNcD'});
              }
            }}
            className="bg-[#25D366] text-white rounded-full font-bold hover:bg-[#20b858] transition-all duration-300 px-5 py-2.5 text-xs md:text-sm flex items-center gap-2 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">FALAR NO WHATSAPP</span>
            <span className="md:hidden">WHATSAPP</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 min-h-[75vh] md:min-h-0 flex flex-col justify-center bg-[#121212] animate-in fade-in duration-1000">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#f5f5f5] z-10 pointer-events-none"></div>

          {/* Mobile Video/Banner */}
          <div className="absolute inset-0 md:hidden z-0">
            {isVideo(heroMobile) ? (
              <video key={heroMobile} className="w-full h-full object-cover opacity-60" autoPlay loop muted playsInline poster={campaign.layout_data?.poster_mobile || heroFallbackImg}>
                <source src={heroMobile} type="video/mp4" />
              </video>
            ) : (
              <img key={heroMobile} className="w-full h-full object-cover opacity-60" src={heroMobile} alt="Hero Background Mobile" />
            )}
          </div>

          {/* Desktop Video/Banner */}
          <div className="absolute inset-0 hidden md:block z-0">
            {isVideo(heroDesktop) ? (
              <video key={heroDesktop} className="w-full h-full object-cover opacity-60" autoPlay loop muted playsInline poster={campaign.layout_data?.poster_desktop || heroFallbackImg}>
                <source src={heroDesktop} type="video/mp4" />
              </video>
            ) : (
              <img key={heroDesktop} className="w-full h-full object-cover opacity-60" src={heroDesktop} alt="Hero Background Desktop" />
            )}
          </div>
        </div>

        <div className="relative z-20 max-w-[1200px] mx-auto px-4 md:px-6 w-full text-center md:text-left mt-10 md:mt-0 animate-in slide-in-from-bottom-8 duration-700">
          {/* Badges */}
          <div className="flex justify-center md:justify-start gap-2 mb-6">
            <span className="bg-[#eab308] text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-white opacity-80 animate-pulse"></span>
              LANÇAMENTO
            </span>
            <span className="bg-black/50 backdrop-blur-md text-[#eab308] border border-[#eab308]/30 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              <Building className="w-3 h-3" />
              VILLE DE LISBOA
            </span>
          </div>

          {/* Headlines */}
          <h1 className="text-white text-4xl md:text-6xl font-black mb-4 leading-[1.1] tracking-tight drop-shadow-lg">
            Seu apartamento próprio <br className="hidden md:block" /> com condições <br className="md:hidden" />
            <span className="text-[#a3e635]">que cabem no seu bolso!</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mb-10 drop-shadow-md mx-auto md:mx-0">
            Realize o sonho da casa própria com o <br className="md:hidden" />
            <span className="font-bold">Minha Casa Minha Vida</span> e vantagens exclusivas.
          </p>

          {/* Benefits Cards Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto md:mx-0">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center hover:bg-black/70 hover:-translate-y-1 transition-all duration-300 shadow-lg group">
              <div className="mb-3 transform group-hover:scale-110 transition-transform">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline><circle cx="12" cy="16" r="3" fill="#a3e635" opacity="0.3"></circle><text x="12" y="17.5" fill="#a3e635" fontSize="6" textAnchor="middle" fontWeight="bold">$</text></svg>
              </div>
              <span className="text-white text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">Subsídios de até</span>
              <span className="text-[#a3e635] text-base md:text-lg font-black group-hover:text-[#b4f050] transition-colors">R$ 55 mil</span>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center hover:bg-black/70 hover:-translate-y-1 transition-all duration-300 shadow-lg group">
              <div className="mb-3 transform group-hover:scale-110 transition-transform">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"></path><polyline points="16 6 23 6 23 13"></polyline><circle cx="8" cy="14" r="2" fill="#a3e635" opacity="0.4"></circle><circle cx="14" cy="8" r="2" fill="#a3e635" opacity="0.4"></circle><line x1="7" y1="9" x2="15" y2="15" stroke="#a3e635"></line></svg>
              </div>
              <span className="text-white text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">Menores juros</span>
              <span className="text-[#a3e635] text-base md:text-lg font-black group-hover:text-[#b4f050] transition-colors">do mercado</span>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center hover:bg-black/70 hover:-translate-y-1 transition-all duration-300 shadow-lg group">
              <div className="mb-3 h-[40px] flex flex-col items-center justify-center text-[#a3e635] transform group-hover:scale-110 transition-transform">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">Até</span>
                <span className="text-[28px] font-black leading-none">72x</span>
              </div>
              <span className="text-white text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">Entrada facilitada</span>
              <span className="text-[#a3e635] text-base md:text-lg font-black group-hover:text-[#b4f050] transition-colors">pela MRV</span>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center hover:bg-black/70 hover:-translate-y-1 transition-all duration-300 shadow-lg group">
              <div className="mb-3 transform group-hover:scale-110 transition-transform">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <span className="text-white text-[11px] md:text-sm font-semibold uppercase tracking-wider mb-1">Use seu</span>
              <span className="text-[#a3e635] text-base md:text-lg font-black group-hover:text-[#b4f050] transition-colors">FGTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Form Section */}
      <section id="formulario" className="relative z-30 -mt-20 md:-mt-24 max-w-[900px] mx-auto px-4">
        <div className="bg-white rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] md:shadow-[0_40px_100px_rgba(0,0,0,0.2)] p-6 md:p-12 border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00A34A]/[0.03] to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-4xl font-black text-[#121c2c] mb-2 tracking-tight">
                Faça sua <span className="text-[#00A34A]">simulação gratuita</span> agora!
              </h2>
              <p className="text-gray-500 font-medium text-sm md:text-lg">
                Preencha seus dados e fale com um especialista.
              </p>
            </div>

            <div className="max-w-3xl mx-auto form-grid-override">
              {/* The HotsiteForm needs an override to appear in a single row on desktop if possible. We do this via CSS class targeting its children. */}
              <style>{`
                .form-grid-override form {
                  display: flex;
                  flex-direction: column;
                  gap: 0.75rem;
                }
                @media (min-width: 768px) {
                  .form-grid-override form {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                  }
                  .form-grid-override form > button,
                  .form-grid-override form > .form-full-row {
                    grid-column: span 2;
                  }
                }
                .form-grid-override button[type="submit"] {
                  background: linear-gradient(to right, #00A34A, #008A46);
                  font-weight: 900;
                  font-size: 1.1rem;
                  height: 4rem;
                  border-radius: 9999px;
                  box-shadow: 0 10px 25px -5px rgba(0, 163, 74, 0.4);
                  transition: all 0.3s ease;
                  animation: pulse-soft 3s infinite;
                }
                .form-grid-override button[type="submit"]:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 15px 30px -5px rgba(0, 163, 74, 0.5);
                  background: linear-gradient(to right, #00b853, #00994d);
                  animation: none;
                }
                @keyframes pulse-soft {
                  0% { box-shadow: 0 0 0 0 rgba(0, 163, 74, 0.4); }
                  70% { box-shadow: 0 0 0 10px rgba(0, 163, 74, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(0, 163, 74, 0); }
                }
                .form-grid-override input, .form-grid-override select {
                  border-radius: 9999px;
                  height: 3.5rem;
                  border-color: #e5e7eb;
                  background-color: #fcfcfc;
                  transition: all 0.2s;
                }
                .form-grid-override input:focus, .form-grid-override select:focus {
                  border-color: #00A34A;
                  box-shadow: 0 0 0 3px rgba(0, 163, 74, 0.1);
                  background-color: #fff;
                }
              `}</style>
              <HotsiteForm
                campaignId={campaign.id}
                whatsappNumber={campaign.whatsapp_number}
                whatsappMessage="Olá 👋 Gostaria de fazer uma simulação do Ville de Lisboa."
                buttonText="QUERO MEU APÊ"
              />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] md:text-sm text-gray-400 font-semibold">
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-[#00A34A]" />
              Seus dados estão protegidos. Não enviamos spam.
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios que fazem a diferença */}
      <section className="py-24 bg-[#f5f5f5]" id="beneficios">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700">
            <span className="text-[#00A34A] font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase mb-2 block">Minha Casa Minha Vida</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#121c2c]">
              Benefícios que <span className="text-[#00A34A]">fazem a diferença</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm text-center hover:shadow-[0_20px_40px_rgba(0,163,74,0.08)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#00A34A] shadow-sm group-hover:scale-110 group-hover:border-[#00A34A]/20 transition-all duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline><circle cx="12" cy="16" r="3" fill="#00A34A" opacity="0.2"></circle><text x="12" y="17.5" fill="#00A34A" fontSize="6" textAnchor="middle" fontWeight="bold">$</text></svg>
              </div>
              <h3 className="text-gray-600 font-medium text-base mb-1">Subsídios de até</h3>
              <p className="text-[#00A34A] font-black text-3xl tracking-tight leading-none mb-3">R$ 55 mil</p>
              <p className="text-gray-500 text-sm">Mais economia para você conquistar seu apê.</p>
            </div>

            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm text-center hover:shadow-[0_20px_40px_rgba(0,163,74,0.08)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#00A34A] shadow-sm group-hover:scale-110 group-hover:border-[#00A34A]/20 transition-all duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"></path><polyline points="16 6 23 6 23 13"></polyline></svg>
              </div>
              <p className="text-[#00A34A] font-black text-2xl tracking-tight leading-none mb-1">Menores juros</p>
              <h3 className="text-gray-600 font-medium text-base mb-3">do mercado</h3>
              <p className="text-gray-500 text-sm">Taxas reduzidas que cabem no seu bolso.</p>
            </div>

            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm text-center hover:shadow-[0_20px_40px_rgba(0,163,74,0.08)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#00A34A] shadow-sm group-hover:scale-110 group-hover:border-[#00A34A]/20 transition-all duration-300">
                <Handshake className="w-7 h-7" />
              </div>
              <p className="text-[#00A34A] font-black text-2xl tracking-tight leading-none mb-1">Entrada facilitada</p>
              <h3 className="text-gray-600 font-medium text-base mb-3">pela MRV</h3>
              <p className="text-gray-500 text-sm">Condições especiais para facilitar sua conquista.</p>
            </div>

            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm text-center hover:shadow-[0_20px_40px_rgba(0,163,74,0.08)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-16 h-16 mx-auto bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#00A34A] shadow-sm group-hover:scale-110 group-hover:border-[#00A34A]/20 transition-all duration-300">
                <Landmark className="w-7 h-7" />
              </div>
              <h3 className="text-gray-600 font-medium text-base mb-1">Use seu</h3>
              <p className="text-[#00A34A] font-black text-3xl tracking-tight leading-none mb-3">FGTS</p>
              <p className="text-gray-500 text-sm">Utilize seu FGTS para dar entrada no imóvel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Empreendimento / Galeria */}
      <section className="py-24 bg-white" id="empreendimento">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-[#00A34A] font-bold text-xs tracking-[0.1em] uppercase mb-2 block">Conheça o Empreendimento</span>
              <h2 className="text-4xl md:text-5xl font-black text-[#121c2c] mb-6 tracking-tight">
                Ville de <span className="text-[#00A34A]">Lisboa</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 font-medium leading-relaxed">
                Um lugar completo para sua família viver com conforto, segurança e lazer. Apartamentos modernos, condomínio fechado e toda a qualidade MRV que você já conhece.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700 font-semibold text-base md:text-lg">
                  <div className="text-[#00A34A]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  </div>
                  Apartamentos de 2 quartos
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-semibold text-base md:text-lg">
                  <div className="text-[#00A34A]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                  Opções com varanda
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-semibold text-base md:text-lg">
                  <div className="text-[#00A34A]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </div>
                  Lazer completo
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-semibold text-base md:text-lg">
                  <div className="text-[#00A34A]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  Condomínio fechado
                </li>
              </ul>

              <button
                onClick={() => setSelectedImageIndex(0)}
                className="bg-[#e8f7ec] text-[#00A34A] font-bold py-3 px-6 rounded-full hover:bg-[#d1f0db] transition-colors flex items-center gap-2 uppercase tracking-wide text-sm border border-[#00A34A]/20"
              >
                Ver mais fotos
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 order-1 lg:order-2">
              <div className="col-span-3 aspect-[16/9] rounded-[24px] overflow-hidden shadow-md relative group cursor-pointer" onClick={() => setSelectedImageIndex(0)}>
                <img src={galleryImages[0]} alt="Fachada" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/90 p-3 rounded-full text-[#00A34A]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg></div>
                </div>
              </div>
              {galleryImages[1] && (
                <div className="aspect-square rounded-[20px] overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => setSelectedImageIndex(1)}>
                  <img src={galleryImages[1]} alt="Piscina" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}
              {galleryImages[2] && (
                <div className="aspect-square rounded-[20px] overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => setSelectedImageIndex(2)}>
                  <img src={galleryImages[2]} alt="Lazer" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}
              {galleryImages[3] && (
                <div className="aspect-square rounded-[20px] overflow-hidden shadow-sm relative group cursor-pointer" onClick={() => setSelectedImageIndex(3)}>
                  <img src={galleryImages[3]} alt="Playground" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#00A34A]/80 flex items-center justify-center transition-opacity">
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white font-light text-3xl pb-1">+</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais Icons Row */}
      <section className="py-20 bg-[#f9fafa] border-t border-gray-100" id="diferenciais">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#00A34A] font-bold text-xs tracking-[0.2em] uppercase mb-2 block">Diferenciais</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#121c2c]">
              Tudo o que <span className="text-[#00A34A]">você e sua família</span> merecem
            </h2>
          </div>

          {/* Grid Layout inspired by Reference (6 items with vertical separators on desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-y-12 gap-x-4 text-center">

            <div className="flex flex-col items-center md:border-r border-gray-200 px-2 relative">
              <div className="w-16 h-16 mb-4 text-[#00A34A] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><rect x="9" y="14" width="6" height="8"></rect></svg>
              </div>
              <p className="font-semibold text-[13px] text-[#333] leading-tight">Condomínio<br />fechado</p>
            </div>

            <div className="flex flex-col items-center md:border-r border-gray-200 px-2 relative">
              <div className="w-16 h-16 mb-4 text-[#00A34A] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><circle cx="12" cy="4" r="2" /><circle cx="12" cy="20" r="2" /><circle cx="4" cy="12" r="2" /><circle cx="20" cy="12" r="2" /><path d="M12 6v2M12 16v2M6 12h2M16 12h2" /></svg>
              </div>
              <p className="font-semibold text-[13px] text-[#333] leading-tight">Área de lazer<br />completa</p>
            </div>

            <div className="flex flex-col items-center md:border-r border-gray-200 px-2 relative">
              <div className="w-16 h-16 mb-4 text-[#00A34A] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
              </div>
              <p className="font-semibold text-[13px] text-[#333] leading-tight">Segurança<br />24h</p>
            </div>

            <div className="flex flex-col items-center md:border-r border-gray-200 px-2 relative">
              <div className="w-16 h-16 mb-4 text-[#00A34A] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <p className="font-semibold text-[13px] text-[#333] leading-tight">Localização<br />estratégica</p>
            </div>

            <div className="flex flex-col items-center md:border-r border-gray-200 px-2 relative">
              <div className="w-16 h-16 mb-4 text-[#00A34A] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16H4z" /><path d="M14 2v20" /><path d="M10 12h8" /><path d="M10 8h8" /><path d="M10 16h8" /></svg>
              </div>
              <p className="font-semibold text-[13px] text-[#333] leading-tight">Fácil acesso a<br />comércios, escolas<br />e serviços</p>
            </div>

            <div className="flex flex-col items-center px-2 relative">
              <div className="w-16 h-16 mb-4 text-[#00A34A] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              </div>
              <p className="font-semibold text-[13px] text-[#333] leading-tight">Excelente potencial<br />de valorização</p>
            </div>

          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-[1fr_1.5fr] gap-12 items-center">
          <div>
            <span className="text-[#00A34A] font-bold text-xs tracking-[0.1em] uppercase mb-2 block">Localização</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#008A46] mb-6">
              Caucaia - CE
            </h2>
            <p className="text-gray-600 mb-8 font-medium text-lg leading-relaxed">
              Região que mais cresce na cidade, com fácil acesso a tudo o que você precisa por perto.
            </p>

            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="text-[#00A34A] mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[#121c2c] font-bold text-base md:text-lg">Próximo a comércios</div>
                  <div className="text-gray-500 text-sm mt-1 font-medium">A poucos minutos do futuro Caucaia Shopping</div>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="text-[#00A34A] mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[#121c2c] font-bold text-base md:text-lg">Escolas e creches</div>
                  <div className="text-gray-500 text-sm mt-1 font-medium">Próximo à Fundação Bradesco e ao Sesc Caucaia</div>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="text-[#00A34A] mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[#121c2c] font-bold text-base md:text-lg">Transporte público</div>
                  <div className="text-gray-500 text-sm mt-1 font-medium">Ao lado da Empresa Vitória, com mobilidade facilitada para o dia a dia</div>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="text-[#00A34A] mt-0.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[#121c2c] font-bold text-base md:text-lg">Fácil acesso para Fortaleza e Caucaia</div>
                  <div className="text-gray-500 text-sm mt-1 font-medium">Localização estratégica com acesso pela Av. Mister Hull</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative rounded-[32px] overflow-hidden shadow-lg h-[400px] md:h-[500px] bg-gray-200 border-4 border-gray-50">
            <iframe
              src="https://maps.google.com/maps?q=Av.%20Dom%20Almeida%20Lustosa,%20335-169%20-%20Parque%20Albano%20(Jurema),%20Caucaia%20-%20CE,%2061645-000,%20Brasil&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0 grayscale mix-blend-multiply opacity-80"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa"
            ></iframe>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="bg-white p-2 rounded-full shadow-[0_10px_30px_rgba(0,138,70,0.3)] border-2 border-[#00A34A] flex flex-col items-center justify-center relative">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#00A34A]">
                  <img src={campaign.layout_data?.logo || "/logo-mrv.png"} className="h-8 object-contain" alt="Logo" />
                </div>
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#00A34A] absolute -bottom-[12px]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-[#f0f9f3] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-[#008A46] text-white flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10" />
            </div>
            <p className="text-[#121c2c] font-medium text-lg md:text-xl max-w-sm">
              <strong className="text-[#00A34A] font-black">Mais de 1 milhão de brasileiros</strong> já realizaram o <strong className="text-[#00A34A] font-black">sonho</strong> do imóvel próprio com a MRV.
            </p>
          </div>
          <div className="hidden md:block w-px h-20 bg-gray-300"></div>
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <img src={campaign.layout_data?.logo || "\src\assets\ville-de-lisboa\logo-mrv.png"} alt="MRV" loading="lazy" decoding="async" className="h-12 md:h-16 object-contain mb-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider">
              Construindo sonhos que<br className="md:hidden" /> transformam vidas.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="bg-[#121c2c] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-stretch relative z-10">
          <div className="w-full md:w-1/2 aspect-[21/9] md:aspect-auto">
            <img src="/src/assets/ville-de-lisboa/foto-familia.jpg" alt="Família" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 py-8 px-6 md:py-10 md:px-12 text-center md:text-left flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 md:mb-3 leading-tight">
              Seu apartamento próprio pode estar <span className="text-[#a3e635]">mais perto</span> <br className="hidden md:block" />do que você imagina.
            </h2>
            <p className="text-white/90 font-medium mb-5 md:mb-6 text-sm md:text-base">
              Condições especiais do Minha Casa Minha Vida esperam por você.
            </p>
            <div className="flex flex-col items-center md:items-start">
              <button
                onClick={scrollToForm}
                className="bg-gradient-to-r from-[#00A34A] to-[#008A46] text-white font-black text-base md:text-lg py-4 px-8 rounded-full hover:from-[#00b853] hover:to-[#00994d] transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,163,74,0.4)] hover:shadow-[0_15px_40px_rgba(0,163,74,0.5)] active:scale-95 w-full md:w-auto hover:-translate-y-1 group"
              >
                QUERO SIMULAR AGORA
                <ChevronRight className="w-6 h-6 -mr-1 transform group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
              <p className="mt-3 text-xs text-white/60 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" /> Atendimento rápido e sem compromisso
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-10 border-t border-white/10 pb-32 md:pb-10">
        <div className="max-w-[1200px] mx-auto px-6 text-center text-white/50 text-xs md:text-sm font-medium">
          <p>© {new Date().getFullYear()} {campaign.name}. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Floating CTA Mobile Bottom Bar (Reference Style) */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#00A34A] to-[#008A46] p-3 px-4 shadow-[0_-15px_30px_rgba(0,163,74,0.25)] z-50 transition-transform duration-500 flex items-center justify-between gap-3 border-t border-white/10 ${showFloatingCTA ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 animate-bounce">
            <MessageCircle className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm uppercase leading-tight text-white tracking-tight">Simular no WhatsApp</span>
            <span className="text-[10px] text-white/90 font-medium">Rápido e sem compromisso!</span>
          </div>
        </div>
        <button
          onClick={scrollToForm}
          className="bg-[#eab308] text-[#121c2c] text-[11px] font-black py-3 px-4 rounded-full uppercase flex items-center gap-1 active:scale-95 whitespace-nowrap shadow-[0_5px_15px_rgba(234,179,8,0.4)] tracking-tight relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          QUERO MEU APÊ <ChevronRight className="w-4 h-4 -mr-1" strokeWidth={3} />
        </button>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-0 md:p-8 overflow-hidden" onClick={() => setSelectedImageIndex(null)}>
          <button className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white transition-colors z-[120] bg-black/20 p-2 rounded-full" onClick={() => setSelectedImageIndex(null)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* Rotate Button */}
          <button
            className="md:hidden absolute top-4 left-4 text-white/70 hover:text-white transition-colors z-[120] bg-black/40 backdrop-blur-md p-2.5 rounded-full flex items-center gap-2 border border-white/10"
            onClick={(e) => { e.stopPropagation(); setImageRotation(prev => (prev + 90) % 360); }}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider pr-1">Girar</span>
          </button>

          {galleryImages.length > 1 && (
            <button className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[120] bg-black/20 p-3 rounded-full backdrop-blur-md" onClick={prevImage}>
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          )}

          <div
            className="absolute top-1/2 left-1/2 flex items-center justify-center select-none transition-transform duration-300 ease-out"
            style={{
              transform: `translate(-50%, -50%) rotate(${imageRotation}deg)`,
              width: imageRotation % 180 !== 0 ? '100dvh' : '100vw',
              height: imageRotation % 180 !== 0 ? '100vw' : '100dvh',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={`${selectedImageIndex}-${imageRotation === 0}`} // force slight re-render on first open
              src={galleryImages[selectedImageIndex]}
              alt={`Galeria ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain md:rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-full font-medium z-[110]">
            {selectedImageIndex + 1} / {galleryImages.length}
          </div>

          {/* Rotate Hint for Mobile */}
          <div className={`md:hidden absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all duration-700 z-[110] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 ${showRotateHint && imageRotation === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <RotateCcw className="w-4 h-4 text-[#a3e635]" />
            Toque em girar para ampliar
          </div>

          {galleryImages.length > 1 && (
            <button className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[120] bg-black/20 p-3 rounded-full backdrop-blur-md" onClick={nextImage}>
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
