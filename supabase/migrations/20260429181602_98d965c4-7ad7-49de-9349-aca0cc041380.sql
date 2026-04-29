ALTER TABLE public.campaigns
  ADD COLUMN popup_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN popup_delay_mobile integer NOT NULL DEFAULT 5,
  ADD COLUMN popup_delay_desktop integer NOT NULL DEFAULT 7,
  ADD COLUMN popup_title text NOT NULL DEFAULT 'Quer receber fotos e vídeos dos apartamentos disponíveis?',
  ADD COLUMN popup_subtitle text NOT NULL DEFAULT 'Te envio agora no WhatsApp as melhores opções com entrada parcelada.',
  ADD COLUMN popup_button_text text NOT NULL DEFAULT 'Quero receber agora',
  ADD COLUMN popup_whatsapp_message text NOT NULL DEFAULT 'Olá, quero receber fotos e vídeos dos apartamentos com entrada parcelada',
  ADD COLUMN popup_frequency_hours integer NOT NULL DEFAULT 24;