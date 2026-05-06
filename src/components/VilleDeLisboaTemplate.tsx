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
      <nav className="fixed top-0 w-full z-50 bg-[#f9f9ff]/95 backdrop-blur-md shadow-sm h-20">
        <div className="flex justify-between items-center max-w-[1200px] mx-auto px-6 h-full">
          {campaign.layout_data?.logo ? (
            <img src={campaign.layout_data.logo} alt={campaign.name} className="h-16 object-contain" />
          ) : (
            <span className="text-2xl font-bold text-[#794098]">{campaign.name}</span>
          )}
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#794098] border-b-2 border-[#794098] pb-1 font-semibold transition-all duration-300" href="#localizacao">Localização</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#diferenciais">Diferenciais</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#beneficios">Benefícios</a>
            <a className="text-[#455f88] hover:text-[#8b4aae] transition-all duration-300" href="#sobre">Sobre</a>
          </div>
          <button onClick={scrollToForm} className="bg-[#794098] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#8b4aae] transition-all duration-300 active:scale-95">
            Simular Agora
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="formulario" className="relative min-h-[921px] pt-20 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#121c2c]/90 via-[#121c2c]/60 to-transparent z-10"></div>
          {hero.toLowerCase().match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || hero.includes('.mp4') ? (
            <video className="w-full h-full object-cover" src={hero} autoPlay loop muted playsInline />
          ) : (
            <img className="w-full h-full object-cover" src={hero} alt="Hero Background" />
          )}
        </div>
        <div className="relative z-20 max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full py-12">
          {/* Content Left */}
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {campaign.hero_title}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-[#f6fff4]">
              {campaign.hero_subtitle}
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e3c2f2] text-[#2c133a] text-sm font-bold">✓</span>
                <span className="text-base">Subsídios de até R$ 55 mil</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e3c2f2] text-[#2c133a] text-sm font-bold">✓</span>
                <span className="text-base">Menores juros do mercado</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e3c2f2] text-[#2c133a] text-sm font-bold">✓</span>
                <span className="text-base">Entrada facilitada</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e3c2f2] text-[#2c133a] text-sm font-bold">✓</span>
                <span className="text-base">Use seu FGTS</span>
              </li>
            </ul>
          </div>
          {/* Lead Capture Form */}
          <div className="bg-white p-8 rounded-xl shadow-[0_20px_40px_rgba(69,95,136,0.15)] max-w-md mx-auto md:mr-0 w-full">
            <h2 className="text-2xl font-bold text-[#121c2c] mb-2">Simular meu apê</h2>
            <p className="text-sm text-[#3e4a3f] mb-6">Receba uma simulação personalizada em poucos minutos.</p>
            {/* O HotsiteForm será renderizado com a cor original do tema dele (Tailwind config da base), 
                mas ele atende perfeitamente à funcionalidade. */}
            <HotsiteForm campaignId={campaign.id} whatsappNumber={campaign.whatsapp_number} whatsappMessage={campaign.whatsapp_message} />
            <p className="mt-4 text-[12px] text-[#3e4a3f] text-center">Seus dados estão seguros conosco.</p>
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

      {/* Prova Social */}
      <section className="py-16 bg-[#121c2c] text-white">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Mais de 1 milhão</h2>
          <p className="text-2xl text-[#e3c2f2] max-w-2xl mx-auto">
            de brasileiros já realizaram o sonho da casa própria com parceiros como nós.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-[#f9f9ff] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#794098]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#455f88]/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold text-[#121c2c] mb-6">
            Garanta agora seu apartamento com condições especiais do Minha Casa Minha Vida
          </h2>
          <p className="text-lg text-[#3e4a3f] mb-10 max-w-2xl mx-auto">
            Não deixe para amanhã o sonho que você pode realizar hoje. Fale com um consultor e peça sua simulação grátis.
          </p>
          <a href={`https://wa.me/${campaign.whatsapp_number?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white px-10 py-5 rounded-full font-bold text-lg inline-flex items-center gap-3 hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95">
            Falar no WhatsApp
          </a>
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
