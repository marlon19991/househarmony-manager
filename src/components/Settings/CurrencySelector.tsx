import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrencyStore {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useCurrency = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "currency-storage",
    }
  )
);

const currencies = [
  { code: "USD", symbol: "$", name: "Dólar estadounidense" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "Libra esterlina" },
  { code: "JPY", symbol: "¥", name: "Yen japonés" },
  { code: "MXN", symbol: "$", name: "Peso mexicano" },
];

export const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Selecciona tu moneda</h3>
      <div className="grid grid-cols-1 gap-3">
        {currencies.map((curr) => (
          <button
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className="w-full text-left"
          >
            <Card
              className={`relative p-4 transition-all duration-300 hover:bg-accent ${
                currency === curr.code
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:ring-1 hover:ring-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-medium">{curr.symbol}</span>
                  <div>
                    <p className="font-medium">{curr.name}</p>
                    <p className="text-sm text-muted-foreground">{curr.code}</p>
                  </div>
                </div>
                {currency === curr.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};