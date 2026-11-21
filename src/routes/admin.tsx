import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, ImageUp, Loader2, LogOut, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrand } from "@/lib/brand-context";
import { DEFAULT_BRAND, saveBrand, type Brand } from "@/lib/brand-store";
import { supabase } from "@/lib/supabase";
import { validateEmail, validatePassword } from "@/lib/validation";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Bivo – Admin portal" },
      { name: "description", content: "Change the Bivo name, logo and sign-in text." },
      { property: "og:title", content: "Bivo – Admin portal" },
      { property: "og:description", content: "Change the Bivo name, logo and sign-in text." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(supabase ? null : true);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const check = async (s: Session | null) => {
      setSession(s);
      if (!s) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await client.rpc("is_admin");
      setIsAdmin(!error && data === true);
    };
    void client.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = client.auth.onAuthStateChange((_e, s) => {
      void check(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <main className="bg-page min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to sign-in
          </Link>
          {supabase && session && (
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => supabase?.auth.signOut()}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          )}
        </div>

        {!supabase && (
          <p className="mb-6 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-3 text-sm text-foreground">
            Demo mode: changes are saved in this browser only. Add your Supabase keys to save them for everyone.
          </p>
        )}

        {isAdmin === null ? (
          <div className="grid place-items-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : supabase && !session ? (
          <AdminLogin />
        ) : !isAdmin ? (
          <div className="shadow-card rounded-3xl bg-card p-10 text-center">
            <h1 className="font-display text-3xl font-semibold">No admin access</h1>
            <p className="mt-3 text-muted-foreground">
              {session?.user.email} isn't an admin yet. Add this account to the admins list in Supabase.
            </p>
          </div>
        ) : (
          <BrandEditor />
        )}
      </div>
    </main>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email) ?? validatePassword(password);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (authError) setError(authError.message);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="shadow-card mx-auto max-w-md space-y-5 rounded-3xl bg-card p-10">
      <h1 className="font-display text-3xl font-semibold">Admin sign in</h1>
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
      </Button>
    </form>
  );
}

function resizeImage(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't an image"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function BrandEditor() {
  const { brand, setBrand, ready } = useBrand();
  const [draft, setDraft] = useState<Brand>(brand);
  const [errors, setErrors] = useState<Partial<Record<keyof Brand, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready) setDraft(brand);
  }, [ready, brand]);

  const set = (key: keyof Brand) => (e: ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const onLogoFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5 MB");
      return;
    }
    try {
      const url = await resizeImage(file);
      setDraft((d) => ({ ...d, logoUrl: url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not use that image");
    }
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.appName.trim()) next.appName = "Enter a name";
    else if (draft.appName.trim().length > 40) next.appName = "Keep the name under 40 characters";
    if (!draft.headline.trim()) next.headline = "Enter a heading";
    const supportErr = validateEmail(draft.supportEmail);
    if (supportErr) next.supportEmail = supportErr;
    setErrors(next);
    if (Object.keys(next).length) return;

    const clean: Brand = {
      appName: draft.appName.trim(),
      logoUrl: draft.logoUrl.trim(),
      headline: draft.headline.trim(),
      subline: draft.subline.trim(),
      supportEmail: draft.supportEmail.trim(),
    };
    setSaving(true);
    try {
      await saveBrand(clean);
      setBrand(clean);
      toast.success("Branding saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={onSave} noValidate className="shadow-card space-y-6 rounded-3xl bg-card p-8 sm:p-10">
        <div>
          <h1 className="font-display text-3xl font-semibold">Branding</h1>
          <p className="mt-1 text-sm text-muted-foreground">Change the name, logo and text people see on the sign-in page.</p>
        </div>

        <div className="space-y-3">
          <Label>Logo</Label>
          <div className="flex flex-wrap items-center gap-4">
            <BrandLogo name={draft.appName || "B"} logoUrl={draft.logoUrl} className="h-16 w-16 text-2xl" />
            <Button type="button" variant="outline" className="rounded-full" asChild>
              <label className="cursor-pointer">
                <ImageUp className="h-4 w-4" /> Upload image
                <input type="file" accept="image/*" className="sr-only" onChange={onLogoFile} />
              </label>
            </Button>
            {draft.logoUrl && (
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setDraft((d) => ({ ...d, logoUrl: "" }))}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
          <Input
            placeholder="…or paste an image link (https://…)"
            value={draft.logoUrl.startsWith("data:") ? "" : draft.logoUrl}
            onChange={set("logoUrl")}
            className="h-11 rounded-xl"
          />
        </div>

        <TextField id="appName" label="App name" value={draft.appName} onChange={set("appName")} error={errors.appName} />
        <TextField id="headline" label="Sign-in heading" value={draft.headline} onChange={set("headline")} error={errors.headline} />
        <TextField id="subline" label="Sign-in subtitle" value={draft.subline} onChange={set("subline")} error={errors.subline} />
        <TextField id="supportEmail" label="Support email" value={draft.supportEmail} onChange={set("supportEmail")} error={errors.supportEmail} />

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => setDraft(DEFAULT_BRAND)}>
            <RotateCcw className="h-4 w-4" /> Reset to default
          </Button>
          <Button type="submit" className="h-11 rounded-full px-7" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        </div>
      </form>

      <aside className="shadow-card h-fit rounded-3xl bg-card p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Live preview</p>
        <div className="mt-6">
          <BrandLogo name={draft.appName || "B"} logoUrl={draft.logoUrl} />
          <h2 className="mt-6 font-display text-3xl font-semibold">{draft.headline || "Sign in"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{draft.subline}</p>
          <div className="mt-6 h-12 rounded-xl border border-input" />
          <div className="mt-4 flex justify-end">
            <span className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">Next</span>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">© {draft.appName}</p>
        </div>
      </aside>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={onChange} aria-invalid={!!error} className="h-11 rounded-xl" />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
