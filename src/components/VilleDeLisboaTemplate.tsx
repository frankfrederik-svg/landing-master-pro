import { useState, useEffect } from "react";
import { HotsiteForm } from "./HotsiteForm";
import { resolveImage } from "@/lib/faixa";

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

  const hero = campaign.banner_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBueCwgJ97yJn2N2uZcVoKVXI1UGZT0D54Bn7JpIL0A8IX2CFEtCK3twYewgbNT5qhk3gGjJBKaaNAqJRqsIFzwXlcUFEgOp2RYZw0xSXBagAqG4DziccCi8H7MI7Hxcrbgsf_Q7k_u1otNOw1kuWpPkFEODmyojSIYNbId3oHqaH_b1ktFY_3e6oaejQiVy7zlvH3RpwwuYVxUdgG6y3z3w-Tb5k_KTn256CHLudAw-dFMqG3_wOcvdxKjXRScyuTi66TwVeVhya8";

  // Gallery
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Prova Social Counter
  const [reservasCount, setReservasCount] = useState(1);
  useEffect(() => {
    let current = 1;
    const interval = setInterval(() => {
      if (current < 62) {
        current += Math.floor(Math.random() * 5) + 2;
        if (current > 62) current = 62;
        setReservasCount(current);
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setGalleryIndex(i => (i + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  return (
    <div className="bg-[#f9f9ff] text-[#121c2c] font-sans overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f9f9ff]/95 backdrop-blur-md shadow-sm h-16 md:h-20 transition-all">
        <div className="flex justify-between items-center max-w-[1200px] mx-auto px-4 md:px-6 h-full gap-3">
          {campaign.layout_data?.logo ? (
            <img src={campaign.layout_data.logo} alt={campaign.name} className="h-10 md:h-14 w-auto object-contain max-w-[130px] md:max-w-none" />
          ) : (
            <span className="text-xl md:text-2xl font-bold text-[#794098] truncate">{campaign.name}</span>
          )}
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#794098] border-b-2 border-[#794098] pb-1 font-semibold transition-all duration-300" href="#localizacao">Localização</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#diferenciais">Diferenciais</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#beneficios">Benefícios</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#sobre">Sobre</a>
          </div>
          <button onClick={scrollToForm} className="bg-[#794098] text-white px-5 py-2 md:px-6 md:py-3 text-[13px] md:text-base rounded-full font-semibold hover:bg-[#8b4aae] transition-all duration-300 active:scale-95 whitespace-nowrap shadow-sm">
            Simular Agora
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="formulario" className="relative min-h-[100vh] md:min-h-[800px] pt-24 pb-12 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#121c2c] via-[#121c2c]/70 to-[#121c2c]/30 z-10 md:bg-gradient-to-r md:from-[#121c2c]/90 md:via-[#121c2c]/60 md:to-transparent"></div>
          {hero.toLowerCase().match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || hero.includes('.mp4') ? (
            <video className="w-full h-full object-cover" src={hero} autoPlay loop muted playsInline />
          ) : (
            <img className="w-full h-full object-cover" src={hero} alt="Hero Background" />
          )}
        </div>
        <div className="relative z-20 max-w-[800px] mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center w-full pt-6 pb-16">
          <div className="text-white flex flex-col items-center w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-lg">
              {campaign.hero_title || "Saia do aluguel com parcelas facilitadas em até 72x pelo Minha Casa Minha Vida"}
            </h1>
            <p className="text-lg md:text-2xl mb-8 md:mb-10 text-[#f6fff4] font-light max-w-3xl drop-shadow-md">
              {campaign.hero_subtitle || "Apartamentos de 2 quartos em Caucaia com lazer completo, entrada facilitada e possibilidade de subsídio de até R$55 mil."}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12 w-full max-w-4xl">
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <span className="text-2xl mb-2">💰</span>
                <span className="text-sm md:text-base font-semibold leading-tight">Subsídio de<br/>até R$55 mil</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#794098] to-[#b971dc] rounded-2xl p-4 border border-[#e3c2f2]/40 shadow-[0_0_20px_rgba(185,113,220,0.5)] transform hover:scale-105 transition-all">
                <span className="text-2xl mb-2">🤝</span>
                <span className="text-sm md:text-base font-extrabold leading-tight">Entrada facilitada<br/>em até 72x</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <span className="text-2xl mb-2">🏦</span>
                <span className="text-sm md:text-base font-semibold leading-tight">Use seu<br/>FGTS</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <span className="text-2xl mb-2">📉</span>
                <span className="text-sm md:text-base font-semibold leading-tight">Menores juros<br/>do mercado</span>
              </div>
            </div>

            <a 
              href={`https://wa.me/${campaign.whatsapp_number?.replace(/\D/g, "")}?text=${encodeURIComponent("Olá 👋 Tenho interesse no Ville de Lisboa e gostaria de fazer minha simulação pelo Minha Casa Minha Vida.")}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366] text-white px-8 md:px-12 py-5 rounded-full font-bold text-lg md:text-xl inline-flex items-center justify-center gap-3 w-full md:w-auto shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.004-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              QUERO FAZER MINHA SIMULAÇÃO
            </a>
          </div>
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
            <div className="flex overflow-hidden rounded-xl shadow-2xl aspect-[16/9]">
              <img src={galleryImages[galleryIndex] as string} className="w-full h-full object-cover transition-opacity duration-500" alt="Galeria" />
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
            <h2 className="text-3xl md:text-5xl font-bold text-[#121c2c] mb-6 leading-tight">
              Quero financiar meu apê<br className="hidden md:block" /> com entrada parcelada
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
    </div>
  );
}
