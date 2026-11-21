import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrand } from "@/lib/brand-context";
import { supabase } from "@/lib/supabase";
import { validateEmail, validateName, validatePassword } from "@/lib/validation";

type Mode = "signin" | "signup";
type Step = "email" | "password" | "done";

export function AuthCard() {
  const { brand } = useBrand();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("email");
    setPassword("");
    setErrors({});
    setNotice(null);
  };

  const onEmailNext = (e: FormEvent) => {
    e.preventDefault();
    const nameErr = mode === "signup" ? validateName(name) : null;
    const emailErr = validateEmail(email);
    if (nameErr || emailErr) {
      setErrors({ ...(nameErr ? { name: nameErr } : {}), ...(emailErr ? { email: emailErr } : {}) });
      return;
    }
    setErrors({});
    setStep("password");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr) {
      setErrors({ password: pwErr });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (supabase) {
        if (mode === "signin") {
          const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          if (error) throw error;
          setNotice(null);
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { data: { full_name: name.trim() } },
          });
          if (error) throw error;
          setNotice(data.session ? null : "Check your inbox to confirm your email address.");
        }
      } else {
        await new Promise((r) => setTimeout(r, 700));
        setNotice("Demo mode — connect Supabase to sign in real accounts.");
      }
      setStep("done");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === "done"
      ? mode === "signin" ? "You're in" : "Account created"
      : step === "password"
        ? mode === "signin" ? "Welcome back" : "Create a password"
        : mode === "signin" ? brand.headline : "Create your account";

  return (
    <div className="shadow-card w-full max-w-4xl rounded-3xl bg-card p-8 sm:p-12 animate-rise">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        {/* Left: brand + heading */}
        <div>
          <BrandLogo name={brand.appName} logoUrl={brand.logoUrl} />
          <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            {step === "password" ? (
              <button
                type="button"
                onClick={() => setStep("email")}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {email.trim()}
              </button>
            ) : step === "done" ? (
              `Signed in as ${email.trim()}`
            ) : mode === "signin" ? (
              brand.subline
            ) : (
              `Join ${brand.appName} in under a minute`
            )}
          </p>
        </div>

        {/* Right: form */}
        <div className="flex flex-col justify-between">
          {step === "email" && (
            <form onSubmit={onEmailNext} noValidate className="space-y-5">
              {mode === "signup" && (
                <Field id="name" label="Full name" error={errors.name}>
                  <Input
                    id="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="h-12 rounded-xl text-base"
                  />
                </Field>
              )}
              <Field id="email" label="Email" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-12 rounded-xl text-base"
                />
              </Field>
              <p className="text-sm text-muted-foreground">
                Need help? Contact{" "}
                <a href={`mailto:${brand.supportEmail}`} className="font-medium text-primary hover:underline">
                  {brand.supportEmail}
                </a>
              </p>
              <Actions
                secondaryLabel={mode === "signin" ? "Create account" : "I have an account"}
                onSecondary={() => switchMode(mode === "signin" ? "signup" : "signin")}
                primaryLabel="Next"
              />
            </form>
          )}

          {step === "password" && (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <Field id="password" label="Password" error={errors.password}>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="h-12 rounded-xl pr-12 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              {errors.form && (
                <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errors.form}
                </p>
              )}
              <Actions
                secondaryLabel="Back"
                onSecondary={() => setStep("email")}
                primaryLabel={mode === "signin" ? "Sign in" : "Create account"}
                loading={loading}
              />
            </form>
          )}

          {step === "done" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-secondary-foreground">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                <span>
                  {mode === "signin" ? "Signed in successfully." : `Welcome to ${brand.appName}, ${name.trim()}!`}
                </span>
              </div>
              {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
              <Button variant="outline" className="rounded-full" onClick={() => switchMode("signin")}>
                Use another account
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {brand.appName}</span>
        <Link to="/admin" className="hover:text-foreground">
          Admin portal
        </Link>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Actions({
  primaryLabel,
  secondaryLabel,
  onSecondary,
  loading,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  onSecondary: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4">
      <Button type="button" variant="ghost" className="rounded-full text-primary" onClick={onSecondary}>
        {secondaryLabel}
      </Button>
      <Button type="submit" className="h-11 rounded-full px-7" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {primaryLabel}
      </Button>
    </div>
  );
}
