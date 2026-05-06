import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ImageUpload({ value, onChange, label = "Upload de Imagem" }: { value: string | null; onChange: (url: string | null) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      onChange(data.publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative rounded-md overflow-hidden border">
          {value.toLowerCase().match(/\.(mp4|webm|mov|mkv)(\?.*)?$/) || value.includes('.mp4') ? (
            <video src={value} autoPlay loop muted playsInline className="w-full h-32 object-cover" />
          ) : (
            <img src={value} alt="Preview" className="w-full h-32 object-cover" />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 bg-muted/50 text-muted-foreground hover:bg-muted transition-colors cursor-pointer" onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 mb-2" />}
          <span className="text-xs">{uploading ? "Enviando..." : label}</span>
        </div>
      )}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*,video/*"
        onChange={handleUpload}
      />
    </div>
  );
}
