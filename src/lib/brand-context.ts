import { createContext, useContext } from "react";

import type { Brand } from "./brand-store";

export type BrandContextValue = {
  brand: Brand;
  ready: boolean;
  refresh: () => Promise<void>;
  setBrand: (b: Brand) => void;
};

export const BrandContext = createContext<BrandContextValue | null>(null);

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used inside <BrandProvider>");
  return ctx;
}
