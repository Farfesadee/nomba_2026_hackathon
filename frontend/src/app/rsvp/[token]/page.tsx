"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ErrorBoundary } from "@/components/shared/error-boundary";

type RSVPInfo = {
  guest: { id: number; name: string; rsvp_status: string };
  event: {
    id: number;
    title: string;
    host_name: string;
    event_date: string;
    event_time: string;
    venue: string;
    dress_code: string | null;
    description: string | null;
    cover_image: string | null;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function RSVPContent() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<RSVPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/rsvp/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid or expired RSVP link");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const submitRSVP = async (status: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to submit RSVP");
      }
      setSelected(status);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    }
    setSubmitting(false);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
        <div className="w-full max-w-lg space-y-4">
          <div className="skeleton h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div
            className="rounded-2xl p-8 space-y-4"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}
          >
            <div className="skeleton h-40 w-full rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="skeleton h-5 w-1/3 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="skeleton h-8 w-2/3 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="skeleton h-4 w-full rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div className="relative z-10 text-center w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <Image             src="/logo-white.png"
            alt="accredit.vip"
            width={130}
            height={34}
            className="h-7 w-auto object-contain mx-auto" />
          </Link>
          <div
            className="p-10 rounded-3xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-3">Invitation Not Found</h1>
            <p className="text-white/60 text-sm mb-8">{error || "We couldn't find your invitation. The link may be invalid or expired."}</p>
            <Link href="/" className="btn-primary w-full justify-center">
              Go to accredit.vip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { guest, event } = data;

  /* ── Already responded ── */
  if (guest.rsvp_status !== "pending") {
    const statusMap: Record<string, { icon: string; color: string; label: string }> = {
      accepted: { icon: "✅", color: "#10b981", label: "Accepted" },
      declined: { icon: "❌", color: "#ef4444", label: "Declined" },
      maybe: { icon: "🤔", color: "#f59e0b", label: "Maybe" },
    };
    const s = statusMap[guest.rsvp_status] || { icon: "✅", color: "#E91E8C", label: guest.rsvp_status };

    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div className="relative z-10 text-center w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <Image             src="/logo-white.png"
            alt="accredit.vip"
            width={130}
            height={34}
            className="h-7 w-auto object-contain mx-auto" />
          </Link>
          <div
            className="p-10 rounded-3xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}
          >
            <div className="text-6xl mb-4">{s.icon}</div>
            <h1 className="text-2xl font-extrabold text-white mb-2">RSVP Already Submitted</h1>
            <p className="text-white/55 text-sm mb-1">
              You responded: <span className="font-bold" style={{ color: s.color }}>{s.label}</span>
            </p>
            <p className="text-white/40 text-sm mb-2">for <span className="text-white/70">{event.title}</span></p>
            <p className="text-white/30 text-xs">Hosted by {event.host_name}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Done ── */
  if (done) {
    const messages: Record<string, { emoji: string; title: string; desc: string; color: string }> = {
      accepted: {
        emoji: "🎉",
        title: "See you there!",
        desc: `You've confirmed attendance at ${event.title}. We can't wait to see you!`,
        color: "#10b981",
      },
      declined: {
        emoji: "💔",
        title: "Sorry you can't make it",
        desc: `You've declined the invitation to ${event.title}. You'll be missed!`,
        color: "#ef4444",
      },
      maybe: {
        emoji: "🤔",
        title: "Thanks for letting us know",
        desc: `We've noted your maybe for ${event.title}. Let us know if your plans change!`,
        color: "#f59e0b",
      },
    };
    const m = messages[selected || "accepted"];

    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div className="relative z-10 text-center w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <Image             src="/logo-white.png"
            alt="accredit.vip"
            width={130}
            height={34}
            className="h-7 w-auto object-contain mx-auto" />
          </Link>
          <div
            className="p-10 rounded-3xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}
          >
            <div className="text-7xl mb-5">{m.emoji}</div>
            <h1 className="text-3xl font-extrabold text-white mb-3">{m.title}</h1>
            <p className="text-white/65 leading-relaxed mb-4">{m.desc}</p>
            <p className="text-white/30 text-xs">Hosted by <span className="text-white/50">{event.host_name}</span></p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main RSVP form ── */
  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col relative overflow-hidden">
      {/* Brand accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#E91E8C] via-[#C4166F] to-[#E91E8C]" />

      {/* Background orbs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #4f7cdc 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* Logo header */}
      <div className="relative z-10 flex justify-center pt-8 pb-2">
        <Link href="/">
          <Image src="/logo-white.png" alt="accredit.vip" width={130} height={34} className="h-7 w-auto object-contain" />
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Cover image */}
            {event.cover_image ? (
              <div
                className="h-52 bg-cover bg-center"
                style={{ backgroundImage: `url(${event.cover_image})` }}
              />
            ) : (
              <div
                className="h-40 flex items-center justify-center text-6xl"
                style={{ background: "linear-gradient(135deg, rgba(233,30,140,0.3) 0%, rgba(13,27,42,0.8) 100%)" }}
              >
                🎉
              </div>
            )}

            <div className="p-8">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{ background: "rgba(233,30,140,0.15)", border: "1px solid rgba(233,30,140,0.3)", color: "#E91E8C" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E91E8C] animate-pulse" />
                Personal Invitation
              </div>

              <h1 className="text-2xl font-extrabold text-white mb-2">You&apos;re Invited!</h1>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Dear <span className="text-white font-semibold">{guest.name}</span>, you are cordially
                invited to an event hosted by{" "}
                <span className="text-white font-semibold">{event.host_name}</span>.
              </p>

              {/* Event details */}
              <div
                className="rounded-2xl p-5 mb-6 space-y-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h2 className="font-bold text-white text-base">{event.title}</h2>

                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(233,30,140,0.15)" }}
                  >
                    <svg className="w-4 h-4 text-[#E91E8C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{event.event_date}</p>
                    <p className="text-white/45 text-xs">{event.event_time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(233,30,140,0.15)" }}
                  >
                    <svg className="w-4 h-4 text-[#E91E8C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{event.venue}</p>
                  </div>
                </div>

                {event.dress_code && (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(233,30,140,0.15)" }}
                    >
                      <svg className="w-4 h-4 text-[#E91E8C]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white/45 text-xs">Dress Code</p>
                      <p className="text-white text-sm font-medium">{event.dress_code}</p>
                    </div>
                  </div>
                )}

                {event.description && (
                  <p className="text-white/50 text-xs leading-relaxed pt-1 border-t border-white/08">
                    {event.description}
                  </p>
                )}
              </div>

              {/* RSVP section */}
              <p className="text-white/70 text-sm font-semibold mb-4">Will you be attending?</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => submitRSVP("accepted")}
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                  }}
                >
                  {submitting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>✅ Yes, I&apos;ll be there!</>
                  )}
                </button>

                <button
                  onClick={() => submitRSVP("maybe")}
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  🤔 Maybe
                </button>

                <button
                  onClick={() => submitRSVP("declined")}
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl text-white/60 font-semibold text-sm transition-all hover:text-white/80 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "transparent" }}
                >
                  💔 Sorry, can&apos;t make it
                </button>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div className="text-center mt-6">
            <p className="text-white/20 text-xs">
              Powered by{" "}
              <Link href="/" className="text-white/40 hover:text-white/60 transition-colors">
                accredit.vip
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RSVPPage() {
  return (
    <ErrorBoundary>
      <RSVPContent />
    </ErrorBoundary>
  );
}
