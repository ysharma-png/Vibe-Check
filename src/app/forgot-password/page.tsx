"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { checkRateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { ArrowRight, Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage(null);

    // Rate limiting: 3 reset requests per 60s
    const rateCheck = checkRateLimit(
      `reset:${data.email.toLowerCase()}`,
      RATE_LIMIT_PRESETS.passwordReset
    );
    if (!rateCheck.allowed) {
      setErrorMessage(rateCheck.message ?? "Too many reset attempts. Please wait.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      // Always show generic success to prevent email enumeration attacks
      if (error) {
        setIsSuccess(true);
        return;
      }

      setIsSuccess(true);
    } catch {
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-content-primary flex flex-col justify-between items-center px-4 py-8">
      {/* Top Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between">
        <Link href="/about" className="inline-flex items-center gap-2 group">
          <span className="h-2.5 w-2.5 rounded-full bg-accent group-hover:scale-125 transition-transform" />
          <span className="font-semibold text-lg tracking-tight text-white">CacheFlow</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 my-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light tracking-tight text-content-primary">
            Reset your password
          </h1>
          <p className="text-xs text-content-muted">
            Enter your email to receive a secure, single-use password recovery link.
          </p>
        </div>

        <div className="p-7 rounded-3xl border border-surface-border bg-surface shadow-2xl backdrop-blur-xl space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-semibold text-content-primary">Recovery email sent</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                If an account exists for that email, a password reset link has been dispatched. The link is single-use and expires in 15 minutes.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-content-muted block font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-content-faint" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                    autoFocus
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 pt-0.5">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-accent text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{isSubmitting || isLoading ? "Sending Link..." : "Send Reset Link"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-content-muted">
          Remember your password?{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
