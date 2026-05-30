"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureLayout } from "@/components/shared/feature-layout";

const icon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export default function AIAssistancePage() {
  return (
    <FeatureLayout icon={icon} title="AI Assistance" tag="AI-Powered" tagColor="#E91E8C">
      <div className="prose prose-sm max-w-none space-y-6">
        <p className="text-lg leading-relaxed" style={{ color: "#4b5563" }}>
          Built-in AI tools to help you create better events faster. From smart invite text generation 
          to an intelligent support chatbot that answers your questions instantly — Accredit.vip uses AI 
          to simplify your workflow.
        </p>

        <h2 className="text-xl font-bold mt-10" style={{ color: "#0D1B2A" }}>AI Features</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "AI Support Chatbot", desc: "Click the chat bubble in the bottom-right corner of any page. Ask questions about creating events, managing guests, sending invites, QR codes, and more. The chatbot provides instant, accurate answers based on the platform's knowledge base." },
            { title: "Smart Suggestions", desc: "Get intelligent recommendations for guest list optimisation, optimal send times for invitations, and best practices for event setup based on your event type." },
            { title: "FAQ-Based Responses", desc: "The AI assistant is pre-loaded with answers to the most common questions. No internet connection required — responses are fast and always available." },
            { title: "Easy to Use", desc: "No complex setup. The AI assistant works out of the box. Just click, type your question, and get an immediate answer." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border p-5" style={{ borderColor: "#fce7f3" }}>
              <h3 className="font-bold text-sm mb-1" style={{ color: "#0D1B2A" }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mt-10" style={{ color: "#0D1B2A" }}>What You Can Ask</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "How do I create an event?",
            "How do I add guests via CSV?",
            "How do I send WhatsApp invites?",
            "How do QR codes work?",
            "How do I sell tickets?",
            "How do I reset my password?",
            "What does each invite channel cost?",
            "How do I contact support?",
          ].map((item) => (
            <span key={item} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#fce7f3", color: "#E91E8C" }}>{item}</span>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t">
          <Link href="/create-event"><Button style={{ background: "#E91E8C" }} className="h-12 px-8 text-base font-bold">CREATE EVENT</Button></Link>
        </div>
      </div>
    </FeatureLayout>
  );
}
