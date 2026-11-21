import { supabase } from "./supabase";

export type Brand = {
  appName: string;
  logoUrl: string;
  headline: string;
  subline: string;
  supportEmail: string;
};

export const DEFAULT_BRAND: Brand = {
  appName: "Bivo",
  logoUrl: "",
  headline: "Sign in",
  subline: "Use your Bivo account to continue",
  supportEmail: "help@bivo.app",
};

const STORAGE_KEY = "bivo.brand";
const TABLE = "brand_settings";

function fromRow(row: Record<string, unknown> | null): Brand {
  if (!row) return DEFAULT_BRAND;
  return {
    appName: (row["app_name"] as string) || DEFAULT_BRAND.appName,
    logoUrl: (row["logo_url"] as string) || "",
    headline: (row["headline"] as string) || DEFAULT_BRAND.headline,
    subline: (row["subline"] as string) || DEFAULT_BRAND.subline,
    supportEmail: (row["support_email"] as string) || DEFAULT_BRAND.supportEmail,
  };
}

export async function loadBrand(): Promise<Brand> {
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return fromRow(data);
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? { ...DEFAULT_BRAND, ...(JSON.parse(raw) as Partial<Brand>) } : DEFAULT_BRAND;
}

export async function saveBrand(brand: Brand): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from(TABLE).upsert({
      id: 1,
      app_name: brand.appName,
      logo_url: brand.logoUrl,
      headline: brand.headline,
      subline: brand.subline,
      support_email: brand.supportEmail,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(brand));
}
