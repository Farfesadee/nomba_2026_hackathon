"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { GoBack } from "@/components/shared/go-back";

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient("/auth/change-password", {
        method: "POST",
        body: { current_password: currentPassword, new_password: newPassword },
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-semibold">Password Changed</h1>
          <p className="text-sm text-muted-foreground">Your password has been updated successfully.</p>
          <Link href="/dashboard"><Button className="w-full">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="mb-2"><GoBack fallback="/dashboard" /></div>
        <div className="text-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Accredit<span className="text-primary">.vip</span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Change Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your account password
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" required />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
