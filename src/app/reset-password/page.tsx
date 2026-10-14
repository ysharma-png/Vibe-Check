"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/auth/password-policy";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

const ResetPasswordSchema = z
  .object({
    password: z.string().min(10, "Password must be at least 10 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }

    const policy = validatePassword(data.password);
    if (!policy.isValid) {
      for (const err of policy.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
          path: ["password"],
        });
      }
    }
  });

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const watchedPassword = watch("password");
  const strengthResult = validatePassword(watchedPassword || "");

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Update user password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // 2. Invalidate all existing sessions (scope: 'global')
      await supabase.auth.signOut({ scope: "global" });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-content-primary flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <span className="h-2 w-2 rounded-full bg-accent group-hover:scale-125 transition-transform" />
            <span className="font-semibold text-lg tracking-tight text-content-primary">CacheFlow</span>
          </Link>
          <h1 className="text-2xl font-light tracking-tight text-content-primary">
            Set new password
          </h1>
          <p className="text-xs text-content-muted">
            Must be at least 10 characters and satisfy our entropy &amp; dictionary policy.
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
              <h3 className="text-sm font-semibold text-content-primary">Password updated successfully</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                All existing sessions on other devices have been invalidated. Redirecting you to sign in with your new credentials...
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                >
                  <span>Sign in now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-content-muted block font-medium">New Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-content-faint" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-content-faint hover:text-content-muted"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {watchedPassword && watchedPassword.length > 0 && (
                  <PasswordStrengthMeter result={strengthResult} />
                )}

                {errors.password && (
                  <p className="text-[11px] text-rose-400 pt-0.5">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-content-muted block font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-content-faint" />
                  <input
                    {...register("confirmPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 pt-0.5">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-accent text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{isSubmitting || isLoading ? "Updating Password..." : "Update Password & Invalidate Sessions"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
