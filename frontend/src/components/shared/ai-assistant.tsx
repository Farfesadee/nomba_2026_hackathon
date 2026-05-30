"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const FAQ: Record<string, string> = {
  "create event": "To create an event, go to your Dashboard and click 'Create Event'. You can choose between 'Post Invite' (private) or 'Post Event' (public with ticketing).",
  "add guests": "After creating an event, open it and use the 'Add Guest' form. You can also import guests via CSV with columns: name, phone, email.",
  "send invites": "Use the 'Send Invites' section in your event detail page. Choose Email, WhatsApp, or SMS channel. Each guest gets an RSVP link.",
  "ticket": "To sell tickets, create a 'Post Event' type and set a ticket price. Buyers pay via Paystack and receive a QR ticket.",
  "qr": "Generate QR codes for each guest from the event detail page. Use the QR Verify endpoint to scan at the door.",
  "rsvp": "Guests receive an RSVP link via their invite. They can Accept, Decline, or Maybe. You see real-time stats on the event page.",
  "pricing": "Pricing is by delivery channel for 1-100 guests: Email is ₦100k, WhatsApp is ₦200k, and SMS is ₦300k. QR codes are included.",
  "contact": "Use the Contact page or email support@accredit.vip. We typically respond within 24 hours.",
};

const GREETING = "Hi! I'm the Accredit.vip assistant. Ask me about creating events, managing guests, sending invites, ticketing, QR codes, or anything else!";

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const right = typeof window !== "undefined" ? 24 : 24;
    const bottom = typeof window !== "undefined" ? 80 : 80;
    setPos({ x: right, y: bottom });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setShowTooltip(false);
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      return;
    }
    const timer = setTimeout(() => setShowTooltip(true), 5000);
    tooltipTimer.current = timer;
    return () => { clearTimeout(timer); };
  }, [open]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    setShowTooltip(false);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPos({
        x: Math.max(0, dragStart.current.posX - dx),
        y: Math.max(0, dragStart.current.posY - dy),
      });
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const lower = text.toLowerCase();
    let reply = "I'm not sure about that. Try asking about: creating events, adding guests, sending invites, ticketing, QR codes, RSVP, or pricing.";

    for (const [key, answer] of Object.entries(FAQ)) {
      if (lower.includes(key)) {
        reply = answer;
        break;
      }
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    }, 400);
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[520px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ right: typeof pos.x === "number" ? `${pos.x}px` : undefined }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">Accredit.vip Assistant</span>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <button type="submit" className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Send</button>
          </form>
        </div>
      )}
      <div
        className="fixed z-50"
        style={{ bottom: `${pos.y}px`, right: `${pos.x}px` }}
        onMouseDown={handleMouseDown}
      >
        <div className="relative">
          {showTooltip && !open && (
            <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
              Need help? Ask me anything!
              <div className="absolute top-full right-4 -mt-px w-2 h-2 bg-foreground rotate-45" />
            </div>
          )}
          <button
            onClick={() => { if (!dragging) setOpen(!open); }}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all flex items-center justify-center select-none"
            title="Ask the AI assistant"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
