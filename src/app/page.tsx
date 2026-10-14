import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

/**
 * Root Page ("/")
 *
 * Enforces zero-flash server-side redirect:
 * - Unauthenticated visitors land immediately on /login.
 * - Authenticated creators land on /dashboard/creator.
 * - Authenticated brands land on /dashboard/brand.
 * - Authenticated admins land on /admin.
 */
export default async function RootPage() {
  const cookieStore = cookies();

  // 1. Check simulated demo session cookie
  const demoRole = cookieStore.get("cf_demo_role")?.value;
  if (demoRole === "creator") redirect("/dashboard/creator");
  if (demoRole === "brand") redirect("/dashboard/brand");
  if (demoRole === "admin") redirect("/admin");

  // 2. Check Supabase verified session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl.includes("placeholder");

  if (isPlaceholder) {
    redirect("/login");
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  const role = (user.user_metadata?.role as string | undefined) ?? "creator";
  if (role === "brand") redirect("/dashboard/brand");
  if (role === "admin") redirect("/admin");
  redirect("/dashboard/creator");
}
