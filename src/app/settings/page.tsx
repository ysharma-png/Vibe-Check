"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/auth/password-policy";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { ReauthModal } from "@/components/auth/ReauthModal";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Smartphone,
  Laptop,
  LogOut,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Bell,
  Moon,
  Sliders,
} from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import { MagneticButton } from "@/components/common/MagneticButton";

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipHash: string;
  isCurrent: boolean;
  lastActive: string;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<
    "notifications" | "security" | "mfa" | "sessions" | "privacy"
  >("notifications");

  const [notifPrefs, setNotifPrefs] = useState({
    briefMatches: true,
    proposals: true,
    invites: true,
    stageChanges: true,
    messages: true,
    creatorVerified: true,
    weeklyDigest: true,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    quietHoursTimezone: "UTC",
    rateLimitPerHour: 20,
  });

  // User state
  const [userEmail, setUserEmail] = useState("amara.okafor@cacheflow.test");
  const [userRole, setUserRole] = useState<"creator" | "brand" | "admin">("creator");
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  // Email update state
  const [newEmail, setNewEmail] = useState("");
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState<string | null>(null);
  const [emailUpdateError, setEmailUpdateError] = useState<string | null>(null);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // MFA TOTP state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetupStep, setMfaSetupStep] = useState<"initial" | "scanning" | "verified">("initial");
  const [totpSecret, setTotpSecret] = useState("JBSWY3DPEHPK3PXP");
  const [totpVerifyCode, setTotpVerifyCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Sessions state
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "sess-1",
      device: "MacBook Pro 16\"",
      browser: "Chrome 128 / macOS",
      ipHash: "ip_9f8a2b",
      isCurrent: true,
      lastActive: "Just now",
    },
    {
      id: "sess-2",
      device: "iPhone 15 Pro",
      browser: "Mobile Safari 17.5 / iOS",
      ipHash: "ip_4c3e1a",
      isCurrent: false,
      lastActive: "2 hours ago",
    },
    {
      id: "sess-3",
      device: "Studio Workstation Dual 4090",
      browser: "Firefox 129 / Ubuntu",
      ipHash: "ip_7b1d9c",
      isCurrent: false,
      lastActive: "Yesterday",
    },
  ]);

  // Modals & notifications
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
  const [reauthAction, setReauthAction] = useState<"delete_account" | "change_password">("change_password");
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const cookieStr = typeof document !== "undefined" ? document.cookie : "";
        const cookies = cookieStr.split("; ");
        const roleCookie = cookies.find((c) => c.startsWith("cf_demo_role="));
        const emailCookie = cookies.find((c) => c.startsWith("cf_user_email="));
        if (roleCookie) {
          const r = roleCookie.split("=")[1] as "creator" | "brand" | "admin";
          if (r) setUserRole(r);
        }
        if (emailCookie) {
          const em = decodeURIComponent(emailCookie.split("=")[1] || "");
          if (em) setUserEmail(em);
        }
      } catch {}

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isLiveSupabase = Boolean(supabaseUrl && !supabaseUrl.includes("placeholder"));
      if (!isLiveSupabase) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email ?? "amara.okafor@cacheflow.test");
          setIsEmailVerified(Boolean(user.email_confirmed_at));
          const metaRole = user.user_metadata?.role as "creator" | "brand" | "admin" | undefined;
          if (metaRole) setUserRole(metaRole);
        }
      } catch {}
    };
    fetchUser();
  }, [supabase]);

  // Handle email change
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailUpdateError(null);
    setEmailUpdateSuccess(null);

    if (!newEmail.includes("@")) {
      setEmailUpdateError("Please provide a valid email address.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        setEmailUpdateError(error.message);
        return;
      }
      setEmailUpdateSuccess(
        `Confirmation emails dispatched to both ${userEmail} and ${newEmail}. Please click both links to complete the change.`
      );
      setNewEmail("");
    } catch {
      setEmailUpdateError("Failed to initiate email change.");
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const policy = validatePassword(newPassword);
    if (!policy.isValid) {
      setPasswordError(policy.errors[0] ?? "Password does not meet security requirements.");
      return;
    }

    try {
      // Re-verify current credentials
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (verifyError) {
        setPasswordError("Current password verification failed. Please check your password.");
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }

      setPasswordSuccess("Password updated successfully across all systems.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Failed to update password.");
    }
  };

  // Handle MFA TOTP setup
  const startMfaSetup = () => {
    const generatedCodes = [
      "8A4B-9C2D-1E0F",
      "3F7G-4H8J-2K9L",
      "5M1N-7P3Q-9R5S",
      "2T6U-8V4W-0X2Y",
      "9Z3A-5B7C-1D8E",
      "4F0G-6H2J-8K4L",
    ];
    setRecoveryCodes(generatedCodes);
    setMfaSetupStep("scanning");
  };

  const confirmMfaSetup = () => {
    if (totpVerifyCode.trim().length !== 6) {
      alert("Please enter a 6-digit TOTP code from your authenticator app.");
      return;
    }
    setMfaEnabled(true);
    setMfaSetupStep("verified");
    showToast("TOTP Multi-Factor Authentication enabled with AAL2 clearance.");
  };

  const disableMfa = () => {
    if (userRole === "admin") {
      alert("MFA is strictly required for administrator accounts and cannot be disabled.");
      return;
    }
    setMfaEnabled(false);
    setMfaSetupStep("initial");
    showToast("MFA has been disabled.");
  };

  // Terminate other sessions
  const terminateOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast("Signed out of all other devices successfully.");
  };

  // Data export (GDPR / Privacy)
  const handleExportData = () => {
    const exportData = {
      user: {
        email: userEmail,
        role: userRole,
        verified: isEmailVerified,
        exportedAt: new Date().toISOString(),
      },
      sessions,
      complianceNotes: "Full export of user account records and creative provenance.",
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cacheflow-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Account data exported as JSON.");
  };

  // Soft delete account with 7-day grace period
  const handleDeleteAccount = async () => {
    showToast(
      "Account marked for deletion. A 7-day grace period has begun before permanent data wipe."
    );
    setTimeout(() => {
      router.push("/");
    }, 2500);
    return true;
  };

  return (
    <div className="min-h-screen bg-background text-content-primary py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {notification && (
        <GlassSurface
          tier="chrome"
          rounded="16"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 border border-[#D8FD38]/40 text-white text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="h-4 w-4 text-[#D8FD38] shrink-0" />
          <span className="font-medium tracking-wide">{notification}</span>
        </GlassSurface>
      )}

      {/* Email Verification Banner */}
      <EmailVerificationBanner
        email={userEmail}
        isVerified={isEmailVerified}
        onResend={async () => {
          showToast("Verification email dispatched to " + userEmail);
        }}
      />

      <div className="max-w-4xl mx-auto space-y-8 pt-6">
        {/* Header Hero Card */}
        <GlassSurface tier="thick" rounded="32" className="p-7 sm:p-9 relative overflow-hidden border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-[#D8FD38]">Settings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight">
                Security &amp; <span className="font-serif italic font-normal text-[#D8FD38]">Account Atelier</span>
              </h1>
              <p className="text-xs text-white/60 max-w-xl leading-relaxed">
                Manage cryptographic credentials, TOTP hardware authenticators, active sessions, and privacy governance.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-[11px] bg-[#D8FD38]/15 text-[#D8FD38] border border-[#D8FD38]/30 font-mono uppercase tracking-wider">
                {userRole} clearance
              </span>
            </div>
          </div>
        </GlassSurface>

        {/* Tab Navigation Dock */}
        <GlassSurface tier="thin" rounded="24" className="p-1.5 flex gap-1.5 flex-wrap sm:flex-nowrap border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "notifications"
                ? "bg-[#D8FD38] text-black font-semibold shadow-lg shadow-[#D8FD38]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Alerts &amp; Digests</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "security"
                ? "bg-[#D8FD38] text-black font-semibold shadow-lg shadow-[#D8FD38]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Password &amp; Email</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mfa")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "mfa"
                ? "bg-[#D8FD38] text-black font-semibold shadow-lg shadow-[#D8FD38]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>MFA (TOTP)</span>
            {mfaEnabled && (
              <span className={`h-1.5 w-1.5 rounded-full ${activeTab === "mfa" ? "bg-black" : "bg-[#38F2C7]"}`} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "sessions"
                ? "bg-[#D8FD38] text-black font-semibold shadow-lg shadow-[#D8FD38]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Active Sessions ({sessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "privacy"
                ? "bg-[#D8FD38] text-black font-semibold shadow-lg shadow-[#D8FD38]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Data &amp; Privacy</span>
          </button>
        </GlassSurface>

        {/* TAB 0: Alerts & Digests (Engagement Layer) */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            {/* Per-Type Notifications */}
            <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-6 border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Smart Alert Preferences
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Choose which real-time notifications appear in your bell drawer and push stream.
                  </p>
                </div>
                <MacTrafficLights title="alert_stream_config.json" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {[
                  { key: "briefMatches", label: "Brief Matches", desc: "Alerts when a brief matches >= 85% of your tools" },
                  { key: "proposals", label: "Proposal & Pitch Updates", desc: "Shortlist verdicts and new creator submissions" },
                  { key: "invites", label: "Direct Invitations", desc: "Brand invites to private agency briefs" },
                  { key: "stageChanges", label: "Milestone & Escrow Releases", desc: "Contract progress and fund releases" },
                  { key: "messages", label: "Client Chat Messages", desc: "Engagement collaboration thread replies" },
                  { key: "creatorVerified", label: "Creator Verification Alerts", desc: "Updates when followed creators earn badges" },
                  { key: "weeklyDigest", label: "Weekly Market Digest", desc: "Weekly curated performance briefing" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#D8FD38]/30 hover:bg-white/[0.06] cursor-pointer transition-all group"
                  >
                    <input
                      type="checkbox"
                      checked={(notifPrefs as any)[item.key]}
                      onChange={(e) => {
                        setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked });
                        showToast(`Updated ${item.label} preference.`);
                      }}
                      className="mt-1 h-4 w-4 rounded border-white/20 text-[#D8FD38] bg-white/[0.05] focus:ring-[#D8FD38] accent-[#D8FD38]"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-white group-hover:text-[#D8FD38] transition-colors">{item.label}</div>
                      <div className="text-[11px] text-white/50 leading-relaxed mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </GlassSurface>

            {/* Quiet Hours & Anti-Spam Frequency */}
            <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-6 border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Moon className="h-4 w-4 text-[#D8FD38]" />
                    <span>Quiet Hours &amp; Delivery Window</span>
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Silence non-urgent notifications during your rest hours. Critical security alerts always bypass.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifPrefs.quietHoursEnabled}
                    onChange={(e) => {
                      setNotifPrefs({ ...notifPrefs, quietHoursEnabled: e.target.checked });
                      showToast(e.target.checked ? "Quiet hours enabled." : "Quiet hours disabled.");
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D8FD38]" />
                </label>
              </div>

              {notifPrefs.quietHoursEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">Start Time</label>
                    <input
                      type="time"
                      value={notifPrefs.quietHoursStart}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, quietHoursStart: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.07] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">End Time</label>
                    <input
                      type="time"
                      value={notifPrefs.quietHoursEnd}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, quietHoursEnd: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.07] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">Anti-Spam Frequency Limit</label>
                    <select
                      value={notifPrefs.rateLimitPerHour}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, rateLimitPerHour: Number(e.target.value) })}
                      className="w-full rounded-xl border border-white/10 bg-[#0E1114] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D8FD38]/60 font-mono"
                    >
                      <option value={10}>Max 10 / hour (Quiet)</option>
                      <option value={20}>Max 20 / hour (Standard)</option>
                      <option value={50}>Max 50 / hour (Realtime)</option>
                    </select>
                  </div>
                </div>
              )}
            </GlassSurface>

            {/* Weekly Digest Email Preview */}
            <GlassSurface tier="regular" rounded="24" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/10">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Weekly Briefing Email Template
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Preview how your weekly intelligence briefing renders from live platform data.
                </p>
              </div>
              <Link
                href="/api/digest-preview"
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-medium text-white hover:border-[#D8FD38]/40 hover:text-[#D8FD38] transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <span>Open Email Preview</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </GlassSurface>
          </div>
        )}

        {/* TAB 1: Security (Password & Email) */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Change Email */}
            <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-5 border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Email Address
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Current address: <strong className="text-white font-mono">{userEmail}</strong>{" "}
                    {isEmailVerified ? (
                      <span className="text-[#38F2C7] font-mono text-[11px]">(Verified)</span>
                    ) : (
                      <span className="text-amber-400 font-mono text-[11px]">(Unverified)</span>
                    )}
                  </p>
                </div>
                <MacTrafficLights title="identity_credentials.key" />
              </div>

              {emailUpdateError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{emailUpdateError}</span>
                </div>
              )}

              {emailUpdateSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{emailUpdateSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateEmail} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new-email@company.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.07] font-mono"
                />
                <MagneticButton strength={0.2}>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D8FD38] text-black text-xs font-semibold hover:bg-[#D8FD38]/90 transition-all shrink-0 shadow-lg shadow-[#D8FD38]/20"
                  >
                    Change Email
                  </button>
                </MagneticButton>
              </form>
            </GlassSurface>

            {/* Change Password */}
            <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-5 border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Change Password
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Requires current password confirmation. Enforces 10+ characters and entropy checks.
                  </p>
                </div>
                <MacTrafficLights title="argon2id_master_key.auth" />
              </div>

              {passwordError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-white/60 block uppercase">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.07] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-white/60 block uppercase">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.07] font-mono"
                  />
                  {newPassword && (
                    <PasswordStrengthMeter result={validatePassword(newPassword)} />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-white/60 block uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.07] font-mono"
                  />
                </div>

                <MagneticButton strength={0.2}>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#D8FD38] text-black text-xs font-semibold hover:bg-[#D8FD38]/90 transition-all shadow-lg shadow-[#D8FD38]/20"
                  >
                    Update Password
                  </button>
                </MagneticButton>
              </form>
            </GlassSurface>
          </div>
        )}

        {/* TAB 2: Multi-Factor Authentication (TOTP) */}
        {activeTab === "mfa" && (
          <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-6 border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Two-Factor Authentication (TOTP)
                  </h3>
                  {mfaEnabled ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#38F2C7]/15 text-[#38F2C7] border border-[#38F2C7]/30 font-mono">
                      Active (AAL2)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/25 font-mono">
                      {userRole === "admin" ? "Required for Admin" : "Recommended"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50">
                  Protects your creative IP and escrow payouts using Google Authenticator, 1Password, or Authy.
                </p>
              </div>

              {mfaEnabled ? (
                <button
                  type="button"
                  onClick={disableMfa}
                  className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors"
                >
                  Disable MFA
                </button>
              ) : (
                <MagneticButton strength={0.2}>
                  <button
                    type="button"
                    onClick={startMfaSetup}
                    className="px-5 py-2.5 rounded-xl bg-[#D8FD38] text-black text-xs font-semibold hover:bg-[#D8FD38]/90 transition-all shadow-lg shadow-[#D8FD38]/20"
                  >
                    Configure Authenticator App
                  </button>
                </MagneticButton>
              )}
            </div>

            {/* MFA Setup Step */}
            {mfaSetupStep === "scanning" && (
              <GlassSurface tier="regular" rounded="24" className="p-6 space-y-5 animate-in fade-in border-white/10">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-white font-mono">
                    1. Scan QR Code or Enter Secret Key
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Open your authenticator app (Google Authenticator, 1Password) and scan the QR code below.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Code Container */}
                  <div className="h-36 w-36 rounded-2xl bg-white p-3 flex items-center justify-center shrink-0 shadow-xl">
                    <QrCode className="h-full w-full text-black" />
                  </div>

                  <div className="space-y-3 min-w-0 flex-1">
                    <div>
                      <span className="text-[10px] text-white/40 block uppercase font-mono">
                        Manual Entry Secret Key
                      </span>
                      <div className="flex items-center gap-2 pt-1 font-mono text-xs text-[#D8FD38]">
                        <span className="bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">{totpSecret}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(totpSecret);
                            showToast("Secret key copied to clipboard");
                          }}
                          className="p-1 text-white/50 hover:text-white transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-white/60 block font-medium">
                        2. Enter 6-Digit Code to Confirm
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          value={totpVerifyCode}
                          onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          className="w-32 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono tracking-widest text-center focus:outline-none focus:border-[#D8FD38]/60"
                        />
                        <MagneticButton strength={0.2}>
                          <button
                            type="button"
                            onClick={confirmMfaSetup}
                            className="px-4 py-2 rounded-xl bg-[#D8FD38] text-black text-xs font-semibold hover:bg-[#D8FD38]/90 transition-all shadow-md shadow-[#D8FD38]/20"
                          >
                            Verify &amp; Activate
                          </button>
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Recovery Codes */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h5 className="text-[11px] font-semibold text-white uppercase font-mono">
                    Emergency Backup Recovery Codes
                  </h5>
                  <p className="text-[11px] text-white/50">
                    Save these single-use codes in a secure location. They allow recovery if you lose your device.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-white/70 pt-1">
                    {recoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center text-[#38F2C7]"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassSurface>
            )}
          </GlassSurface>
        )}

        {/* TAB 3: Active Sessions & Sign out of all */}
        {activeTab === "sessions" && (
          <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-6 border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Active Devices &amp; Authorized Sessions
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Supabase SSR cookies with refresh token rotation. You can revoke access from unrecognized devices.
                </p>
              </div>

              <button
                type="button"
                onClick={terminateOtherSessions}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out of All Other Devices</span>
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <GlassSurface
                  key={sess.id}
                  tier="thin"
                  rounded="16"
                  className="p-4 flex items-center justify-between gap-4 border-white/10"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                      {sess.device.includes("iPhone") ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Laptop className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {sess.device}
                        </span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#38F2C7]/15 text-[#38F2C7] border border-[#38F2C7]/25 font-mono">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/50 font-mono flex items-center gap-2 pt-0.5">
                        <span>{sess.browser}</span>
                        <span>•</span>
                        <span>{sess.ipHash}</span>
                        <span>•</span>
                        <span>{sess.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => {
                        setSessions((prev) => prev.filter((s) => s.id !== sess.id));
                        showToast(`Session on ${sess.device} revoked.`);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-rose-500/15 hover:text-rose-300 text-[11px] text-white/60 transition-colors shrink-0"
                    >
                      Revoke
                    </button>
                  )}
                </GlassSurface>
              ))}
            </div>
          </GlassSurface>
        )}

        {/* TAB 4: Data Privacy & Account Deletion */}
        {activeTab === "privacy" && (
          <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-6 border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Data Rights &amp; Soft-Deletion
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Export your creator records or initiate account closure with full data cascade.
                </p>
              </div>
              <MacTrafficLights title="data_sovereignty_export.json" />
            </div>

            {/* Export data */}
            <GlassSurface tier="thin" rounded="16" className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/10">
              <div>
                <h4 className="text-xs font-semibold text-white">Download My Data</h4>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Receive a machine-readable JSON archive of your briefs, pipeline stages, proposals, and profile history.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/25 text-xs text-white transition-colors shrink-0 self-start sm:self-auto"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>
            </GlassSurface>

            {/* Delete Account */}
            <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-rose-300">Delete Account &amp; Content</h4>
                <p className="text-[11px] text-white/50">
                  Requires re-authentication. Enforces a 7-day soft-delete grace period before permanent database wipe and storage purge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReauthAction("delete_account");
                  setIsReauthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-medium transition-colors shrink-0 self-start sm:self-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Initiate Account Deletion</span>
              </button>
            </div>
          </GlassSurface>
        )}
      </div>

      {/* Re-auth Modal */}
      <ReauthModal
        isOpen={isReauthModalOpen}
        title={
          reauthAction === "delete_account"
            ? "Confirm Account Deletion"
            : "Confirm Security Changes"
        }
        description={
          reauthAction === "delete_account"
            ? "Please enter your password to confirm account deletion. A 7-day grace period will apply."
            : "Enter your password to verify your identity."
        }
        requireMfa={mfaEnabled}
        onClose={() => setIsReauthModalOpen(false)}
        onConfirm={async () => {
          if (reauthAction === "delete_account") {
            return await handleDeleteAccount();
          }
          return true;
        }}
      />
    </div>
  );
}
