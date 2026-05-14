import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MultiImageUpload({ value, onChange, label = "Upload de Imagens" }: { value: string[]; onChange: (urls: string[]) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const newUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }

      onChange([...value, ...newUrls]);
      toast.success(`${files.length} imagem(ns) enviada(s) com sucesso!`);
    } catch (error: any) {
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {value.map((url, index) => (
          <div key={index} className="relative rounded-md overflow-hidden border aspect-video group">
            {url.toLowerCase().match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || url.includes('.mp4') ? (
              <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 bg-muted/50 text-muted-foreground hover:bg-muted transition-colors cursor-pointer aspect-video" onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 mb-2" />}
          <span className="text-xs text-center">{uploading ? "Enviando..." : label}</span>
        </div>
      </div>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*,video/*"
        multiple
        onChange={handleUpload}
      />
    </div>
  );
}
