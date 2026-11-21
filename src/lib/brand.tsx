import { useCallback, useEffect, useState, type ReactNode } from "react";

import { BrandContext } from "./brand-context";
import { DEFAULT_BRAND, loadBrand, type Brand } from "./brand-store";

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setBrand(await loadBrand());
    } catch (e) {
      console.error("Could not load brand settings", e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (ready) document.title = `${brand.appName} – Sign in`;
  }, [brand.appName, ready]);

  return (
    <BrandContext.Provider value={{ brand, ready, refresh, setBrand }}>
      {children}
    </BrandContext.Provider>
  );
}
