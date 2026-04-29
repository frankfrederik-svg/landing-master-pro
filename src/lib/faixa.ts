export type IncomeRange =
  | "ate_3200"
  | "3200_5000"
  | "5000_9600"
  | "9600_13000";

export const INCOME_OPTIONS: { value: IncomeRange; label: string }[] = [
  { value: "ate_3200", label: "Até R$ 3.200" },
  { value: "3200_5000", label: "R$ 3.200,01 a R$ 5.000" },
  { value: "5000_9600", label: "R$ 5.000,01 a R$ 9.600" },
  { value: "9600_13000", label: "R$ 9.600,01 a R$ 13.000" },
];

export type FaixaInfo = {
  faixa: 1 | 2 | 3 | 4;
  title: string;
  message: string;
};

export function classifyFaixa(income: IncomeRange): FaixaInfo {
  switch (income) {
    case "ate_3200":
      return {
        faixa: 1,
        title: "Faixa 1 do Minha Casa Minha Vida",
        message: "Maior possibilidade de subsídio do governo.",
      };
    case "3200_5000":
      return {
        faixa: 2,
        title: "Faixa 2 do Minha Casa Minha Vida",
        message: "Ótimas condições com entrada facilitada.",
      };
    case "5000_9600":
      return {
        faixa: 3,
        title: "Faixa 3 do Minha Casa Minha Vida",
        message: "Boas condições de financiamento.",
      };
    case "9600_13000":
      return {
        faixa: 4,
        title: "Faixa 4 do Minha Casa Minha Vida",
        message: "Maior poder de financiamento e mais opções.",
      };
  }
}

export function formatCurrencyBRL(value: number | null | undefined) {
  if (value == null || isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

/** Maps DB image keys (legacy "/src/assets/...") to bundled assets. */
export function resolveImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/src/assets/property-1")) return new URL("../assets/property-1.jpg", import.meta.url).href;
  if (url.startsWith("/src/assets/property-2")) return new URL("../assets/property-2.jpg", import.meta.url).href;
  return url;
}
