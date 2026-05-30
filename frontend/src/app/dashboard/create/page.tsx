"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createEvent } from "@/lib/api/events";
import { GoBack } from "@/components/shared/go-back";
import { VenueInput } from "@/components/shared/venue-input";
import {
  cleanLineup,
  cleanPassPackages,
  lineupRoleOptions,
  parseTimeInputTo24Hour,
  timeOptions,
  timezoneOptions,
  type LineupPerson,
  type PassPackage,
} from "@/lib/event-form-options";

export default function CreateEventPage() {
  const [mode, setMode] = useState<"invite" | "event" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    event_type: "wedding",
    host_name: "",
    event_date: "",
    event_time: "",
    timezone: "WAT",
    venue: "",
    guest_count_range: "1-100",
    description: "",
    dress_code: "",
    map_link: "",
    ticket_price: "",
    tickets_available: "",
    after_party_enabled: false,
    after_party_location: "",
    after_party_time: "",
  });
  const [passPackages, setPassPackages] = useState<PassPackage[]>([
    { name: "Regular", price: "", quantity: "" },
    { name: "VIP", price: "", quantity: "" },
  ]);
  const [lineup, setLineup] = useState<LineupPerson[]>([
    {
      role: "Keynote Speaker",
      name: "",
      attachHeadshot: true,
      headshotSource: "upload",
      headshotFileName: "",
      generatedHeadshot: false,
    },
  ]);

  const updatePassPackage = (index: number, next: Partial<PassPackage>) => {
    setPassPackages((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)));
  };

  const updateLineup = (index: number, next: Partial<LineupPerson>) => {
    setLineup((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createEvent({
        ...form,
        timezone: form.timezone || "WAT",
        event_time: parseTimeInputTo24Hour(form.event_time),
        after_party_time: form.after_party_time ? parseTimeInputTo24Hour(form.after_party_time) : "",
        is_public: mode === "event",
        category: mode === "event" ? form.event_type : undefined,
        ticket_price: form.ticket_price ? Number(form.ticket_price) : undefined,
        tickets_available: form.tickets_available ? Number(form.tickets_available) : undefined,
        pass_packages: mode === "event" ? cleanPassPackages(passPackages) : undefined,
        lineup: mode === "event" ? cleanLineup(lineup) : undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mode) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Accredit<span className="text-primary">.vip</span>
            </Link>
          </div>
        </header>
        <div className="flex-1 container mx-auto px-4 py-8 sm:py-16">
          <div className="mb-4"><GoBack fallback="/dashboard" /></div>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Create an Event</h1>
            <p className="mt-2 text-muted-foreground">Choose how you want to start</p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <button
                onClick={() => setMode("invite")}
                className="rounded-lg border p-8 text-left hover:border-primary transition-colors"
              >
                <h3 className="font-semibold text-lg">Post Invite</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Private invitations for weddings, birthdays, corporate dinners, and VIP gatherings.
                </p>
              </button>
              <button
                onClick={() => setMode("event")}
                className="rounded-lg border p-8 text-left hover:border-primary transition-colors"
              >
                <h3 className="font-semibold text-lg">Post Event</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Public event publishing for concerts, conferences, festivals, and ticketed events.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Accredit<span className="text-primary">.vip</span>
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 py-4"><GoBack fallback="/dashboard" /></div>
      <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <button onClick={() => setMode(null)} className="text-sm text-muted-foreground mb-6">
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold mb-8">
          {mode === "invite" ? "Post Invite" : "Post Event"}
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="concert">Concert</option>
                <option value="conference">Conference</option>
                <option value="festival">Festival</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Host Name</label>
              <input
                value={form.host_name}
                onChange={(e) => setForm({ ...form, host_name: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Guest Count</label>
              <select
                value={form.guest_count_range}
                onChange={(e) => setForm({ ...form, guest_count_range: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1-100">1-100</option>
                <option value="101-200">101-200</option>
                <option value="201-400">201-400</option>
                <option value="400+">400+</option>
              </select>
            </div>
            {mode === "event" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Gate Fee (NGN)</label>
                  <input
                    type="number"
                    value={form.ticket_price}
                    onChange={(e) => setForm({ ...form, ticket_price: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Optional default price"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Passes Available</label>
                  <input
                    type="number"
                    value={form.tickets_available}
                    onChange={(e) => setForm({ ...form, tickets_available: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </>
            )}
          </div>
          {mode === "event" && (
            <fieldset className="rounded-lg border p-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <legend className="text-sm font-semibold">Gate fee / pass packages</legend>
                <button
                  type="button"
                  onClick={() => setPassPackages((current) => [...current, { name: "", price: "", quantity: "" }])}
                  className="w-fit rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-accent"
                >
                  Add package
                </button>
              </div>
              <div className="space-y-3">
                {passPackages.map((item, index) => (
                  <div key={index} className="grid gap-3 rounded-lg bg-muted/40 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <input
                      value={item.name}
                      onChange={(e) => updatePassPackage(index, { name: e.target.value })}
                      className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Regular, VIP, Table for 5"
                    />
                    <input
                      value={item.price}
                      onChange={(e) => updatePassPackage(index, { price: e.target.value })}
                      className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Free, 10000, 250000"
                    />
                    <input
                      value={item.quantity || ""}
                      onChange={(e) => updatePassPackage(index, { quantity: e.target.value })}
                      className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Quantity optional"
                    />
                    <button
                      type="button"
                      onClick={() => setPassPackages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="h-10 rounded-lg border px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </fieldset>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <input
                list="dashboard-event-time-options"
                value={form.event_time}
                onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="7:00 PM"
                required
              />
              <datalist id="dashboard-event-time-options">
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.label} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {timezoneOptions.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
                <optgroup label="Africa">
                  <option value="WAT">🇳🇬 WAT (UTC+1) — Lagos, Nigeria</option>
                  <option value="CAT">🇿🇦 CAT (UTC+2) — Johannesburg, Cape Town</option>
                  <option value="EAT">🇰🇪 EAT (UTC+3) — Nairobi, Dar es Salaam</option>
                  <option value="GMT">🇬🇭 GMT (UTC+0) — Accra, Abidjan</option>
                  <option value="SAST">🇿🇦 SAST (UTC+2) — South Africa (standard)</option>
                  <option value="MUT">🇲🇺 MUT (UTC+4) — Mauritius, Seychelles</option>
                  <option value="WEST">🇲🇦 WEST (UTC+1) — Casablanca, Tunis</option>
                </optgroup>
                <optgroup label="Europe / UK">
                  <option value="BST">🇬🇧 BST (UTC+1) — London (summer)</option>
                  <option value="CET">🇫🇷 CET (UTC+1) — Paris, Berlin, Rome, Madrid</option>
                  <option value="CEST">🇫🇷 CEST (UTC+2) — Central Europe (summer)</option>
                  <option value="EET">🇬🇷 EET (UTC+2) — Athens, Helsinki, Bucharest</option>
                  <option value="EEST">🇬🇷 EEST (UTC+3) — Eastern Europe (summer)</option>
                  <option value="MSK">🇷🇺 MSK (UTC+3) — Moscow, St. Petersburg</option>
                </optgroup>
                <optgroup label="Americas">
                  <option value="EST">🇺🇸 EST (UTC-5) — New York, Miami, Toronto</option>
                  <option value="EDT">🇺🇸 EDT (UTC-4) — Eastern US (summer)</option>
                  <option value="CST">🇺🇸 CST (UTC-6) — Chicago, Mexico City</option>
                  <option value="CDT">🇺🇸 CDT (UTC-5) — Central US (summer)</option>
                  <option value="MST">🇺🇸 MST (UTC-7) — Denver, Phoenix</option>
                  <option value="MDT">🇺🇸 MDT (UTC-6) — Mountain US (summer)</option>
                  <option value="PST">🇺🇸 PST (UTC-8) — Los Angeles, Vancouver</option>
                  <option value="PDT">🇺🇸 PDT (UTC-7) — Pacific US (summer)</option>
                  <option value="AKST">🇺🇸 AKST (UTC-9) — Anchorage, Alaska</option>
                  <option value="HAST">🇺🇸 HAST (UTC-10) — Honolulu, Hawaii</option>
                  <option value="ART">🇦🇷 ART (UTC-3) — Buenos Aires, Montevideo</option>
                  <option value="BRT">🇧🇷 BRT (UTC-3) — Brasília, São Paulo</option>
                  <option value="CLT">🇨🇱 CLT (UTC-4) — Santiago, Asunción</option>
                  <option value="PET">🇵🇪 PET (UTC-5) — Lima, Bogotá, Quito</option>
                  <option value="AST">🇵🇷 AST (UTC-4) — San Juan, Port of Spain</option>
                </optgroup>
                <optgroup label="Asia / Middle East">
                  <option value="GST">🇦🇪 GST (UTC+4) — Dubai, Abu Dhabi, Muscat</option>
                  <option value="AST_A">🇸🇦 AST (UTC+3) — Riyadh, Kuwait, Doha</option>
                  <option value="IST">🇮🇳 IST (UTC+5:30) — New Delhi, Mumbai, Colombo</option>
                  <option value="PKT">🇵🇰 PKT (UTC+5) — Karachi, Lahore, Islamabad</option>
                  <option value="BST_A">🇧🇩 BST (UTC+6) — Dhaka</option>
                  <option value="ICT">🇹🇭 ICT (UTC+7) — Bangkok, Hanoi, Phnom Penh</option>
                  <option value="SGT">🇸🇬 SGT (UTC+8) — Singapore, Kuala Lumpur</option>
                  <option value="CST_A">🇨🇳 CST (UTC+8) — Beijing, Shanghai, Hong Kong</option>
                  <option value="JST">🇯🇵 JST (UTC+9) — Tokyo, Seoul, Osaka</option>
                  <option value="WIB">🇮🇩 WIB (UTC+7) — Jakarta, Sumatra</option>
                  <option value="WITA">🇮🇩 WITA (UTC+8) — Bali, Sulawesi</option>
                  <option value="WIT">🇮🇩 WIT (UTC+9) — Papua, Maluku</option>
                  <option value="PHST">🇵🇭 PHST (UTC+8) — Manila</option>
                </optgroup>
                <optgroup label="Oceania">
                  <option value="AEST">🇦🇺 AEST (UTC+10) — Sydney, Melbourne, Brisbane</option>
                  <option value="AEDT">🇦🇺 AEDT (UTC+11) — Eastern Australia (summer)</option>
                  <option value="ACST">🇦🇺 ACST (UTC+9:30) — Adelaide, Darwin</option>
                  <option value="AWST">🇦🇺 AWST (UTC+8) — Perth</option>
                  <option value="NZST">🇳🇿 NZST (UTC+12) — Auckland, Wellington</option>
                  <option value="NZDT">🇳🇿 NZDT (UTC+13) — New Zealand (summer)</option>
                  <option value="FJT">🇫🇯 FJT (UTC+12) — Suva, Fiji</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Venue</label>
            <VenueInput
              value={form.venue}
              onChange={(v) => setForm({ ...form, venue: v })}
              required
            />
          </div>
          {mode === "event" && (
            <>
              <fieldset className="rounded-lg border p-4 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <legend className="text-sm font-semibold">Headliners, speakers or artistes</legend>
                  <button
                    type="button"
                    onClick={() =>
                      setLineup((current) => [
                        ...current,
                        { role: "", name: "", attachHeadshot: true, headshotSource: "upload", headshotFileName: "", generatedHeadshot: false },
                      ])
                    }
                    className="w-fit rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-accent"
                  >
                    Add person
                  </button>
                </div>
                <div className="space-y-3">
                  {lineup.map((person, index) => (
                    <div key={index} className="space-y-3 rounded-lg bg-muted/40 p-3">
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <input
                          list={`lineup-role-options-${index}`}
                          value={person.role}
                          onChange={(e) => updateLineup(index, { role: e.target.value })}
                          className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Keynote Speaker, Guest Speaker"
                        />
                        <datalist id={`lineup-role-options-${index}`}>
                          {lineupRoleOptions.map((role) => (
                            <option key={role} value={role} />
                          ))}
                        </datalist>
                        <input
                          value={person.name}
                          onChange={(e) => updateLineup(index, { name: e.target.value })}
                          className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Guest name"
                        />
                        <button
                          type="button"
                          onClick={() => setLineup((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          className="h-10 rounded-lg border px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </button>
                      </div>
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={person.attachHeadshot}
                          onChange={(e) => updateLineup(index, { attachHeadshot: e.target.checked })}
                        />
                        Attach headshot to flyer
                      </label>
                      {person.attachHeadshot && (
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm">
                            <input
                              type="radio"
                              checked={person.headshotSource === "upload"}
                              onChange={() => updateLineup(index, { headshotSource: "upload" })}
                            />
                            Upload headshot
                          </label>
                          <label className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm">
                            <input
                              type="radio"
                              checked={person.headshotSource === "ai"}
                              onChange={() => updateLineup(index, { headshotSource: "ai", generatedHeadshot: true })}
                            />
                            Auto Generate
                          </label>
                          {person.headshotSource === "upload" ? (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => updateLineup(index, { headshotFileName: e.target.files?.[0]?.name || "" })}
                              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm md:col-span-2"
                            />
                          ) : (
                            <div className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground md:col-span-2">
                              AI headshot generation selected. Popular-person lookup can be connected to the image service.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-lg border p-4 space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={form.after_party_enabled}
                    onChange={(e) => setForm({ ...form, after_party_enabled: e.target.checked })}
                  />
                  Include after party location
                </label>
                {form.after_party_enabled && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={form.after_party_location}
                      onChange={(e) => setForm({ ...form, after_party_location: e.target.value })}
                      className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="After party venue or address"
                    />
                    <input
                      list="dashboard-after-party-time-options"
                      value={form.after_party_time}
                      onChange={(e) => setForm({ ...form, after_party_time: e.target.value })}
                      className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      placeholder="11:30 PM"
                    />
                    <datalist id="dashboard-after-party-time-options">
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.label} />
                      ))}
                    </datalist>
                  </div>
                )}
              </fieldset>
            </>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-none"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dress Code</label>
              <input
                value={form.dress_code}
                onChange={(e) => setForm({ ...form, dress_code: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Map Link</label>
              <input
                value={form.map_link}
                onChange={(e) => setForm({ ...form, map_link: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </div>
    </div>
  );
}
