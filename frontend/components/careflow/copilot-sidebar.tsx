"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { type Patient } from "@/lib/mock-data"
import { api } from "@/lib/api"
import { retrieveGuidelines, type GuidelineEntry } from "@/lib/guidelines"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  X,
  Send,
  Brain,
  BookOpen,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: GuidelineEntry[]
  isStreaming?: boolean
}

interface CopilotSidebarProps {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
  pendingMessage?: string
  onPendingMessageConsumed?: () => void
}

// Generates a context-aware mock RAG response
function generateResponse(query: string, patient: Patient | null): { text: string; citations: GuidelineEntry[] } {
  const citations = retrieveGuidelines(query + (patient ? ` ${patient.primaryRiskFactor} BMI ${patient.vitals.bmi.value}` : ""), 2)

  const name = patient?.name.split(" ")[0] ?? "this patient"
  const q = query.toLowerCase()

  if (q.includes("care plan") || q.includes("draft")) {
    return {
      text: `Based on **${name}'s** profile (Risk Score: ${patient?.riskScore ?? "N/A"}/100), here is a WHO-compliant NCD Care Plan:\n\n**1. Risk Stratification:** ${patient?.riskLevel === "critical" ? "Critical — Priority Level 1 referral required" : patient?.riskLevel === "warning" ? "Elevated — Enhanced monitoring protocol" : "Stable — Routine follow-up"}\n\n**2. Behavioral Goals:**\n• Primary: Address **${patient?.primaryRiskFactor ?? "identified risk factors"}** through structured Level 3 Counseling\n• Increase physical activity to ≥150 min/week (currently ${patient?.vitals.physicalActivity.value ?? "—"} min/week)\n• Nutritional counseling for BMI management (BMI: ${patient?.vitals.bmi.value ?? "—"})\n\n**3. Follow-up Schedule:** 30-day clinical review, 60-day vitals re-assessment, 90-day risk score recalculation.\n\n**4. Referral Pathway:** ${patient?.riskLevel === "critical" ? "Immediate secondary care referral recommended." : "Primary care monitoring with community health worker support."}`,
      citations,
    }
  }

  if (q.includes("smok") || q.includes("tobacco") || q.includes("cessation")) {
    return {
      text: `For **${name}**, who is a ${patient?.shapFeatures.find(f => f.feature.toLowerCase().includes("smok"))?.rawValue ?? "smoker"}, the recommended intervention is the **WHO 5A Model**:\n\n• **Ask** about current tobacco use frequency and duration\n• **Advise** clearly that quitting reduces their NCD risk by an estimated 22 percentage points\n• **Assess** readiness to quit (contemplation stage)\n• **Assist** with structured motivational interviewing (Schedule Level 3 Counseling)\n• **Arrange** follow-up in 2 weeks with NRT evaluation\n\nCombined behavioral + NRT approach improves cessation rates by 50–70% compared to counseling alone.`,
      citations,
    }
  }

  if (q.includes("risk") || q.includes("explain")) {
    const topFeatures = patient?.shapFeatures.filter(f => f.value > 0).slice(0, 3) ?? []
    const protective = patient?.shapFeatures.filter(f => f.value < 0).slice(0, 2) ?? []
    return {
      text: `**${name}'s** AI risk score of **${patient?.riskScore ?? "—"}/100** is driven by the following key factors:\n\n**Risk-Increasing Factors:**\n${topFeatures.map(f => `• **${f.feature}** (${f.rawValue}) — contributes +${f.value}% to overall risk`).join("\n")}\n\n**Protective Factors:**\n${protective.map(f => `• **${f.feature}** (${f.rawValue}) — reduces risk by ${Math.abs(f.value)}%`).join("\n")}\n\nAddressing the top risk factor alone could reduce the predicted risk score by up to **18–22 points** based on population-level evidence.`,
      citations,
    }
  }

  if (q.includes("bp") || q.includes("blood pressure") || q.includes("hypertens") || q.includes("protocol")) {
    return {
      text: `For **${name}** (BP: ${patient?.vitals.bloodPressure.systolic ?? "—"}/${patient?.vitals.bloodPressure.diastolic ?? "—"} mmHg), the WHO NCD Protocol recommends:\n\n**Immediate Actions:**\n• Confirm BP reading on two separate occasions ≥24 hours apart\n• ${(patient?.vitals.bloodPressure.systolic ?? 0) >= 140 ? "Stage 2 Hypertension confirmed — initiate pharmacological review within 4 weeks" : "Stage 1 Hypertension — lifestyle modification as first-line approach"}\n\n**Lifestyle Interventions:**\n• Sodium restriction to <5g/day\n• DASH dietary pattern\n• Aerobic exercise: 150 min/week (brisk walking acceptable)\n• Limit alcohol to <14 units/week\n\n**Monitoring:** Re-assess BP at every community health worker visit (monthly).`,
      citations,
    }
  }

  // Default contextual response
  return {
    text: `Based on **${name}'s** current health profile:\n\n• **Risk Score:** ${patient?.riskScore ?? "—"}/100 (${patient?.riskLevel ?? "—"} category)\n• **Primary Concern:** ${patient?.primaryRiskFactor ?? "Multiple factors"}\n• **BMI:** ${patient?.vitals.bmi.value ?? "—"} (${patient?.vitals.bmi.label ?? "—"})\n• **BP:** ${patient?.vitals.bloodPressure.systolic ?? "—"}/${patient?.vitals.bloodPressure.diastolic ?? "—"} mmHg\n• **Blood Sugar:** ${patient?.vitals.bloodSugar.value ?? "—"} mg/dL\n\nI recommend focusing on the **${patient?.primaryRiskFactor ?? "identified risk factors"}** as the primary intervention target. Would you like me to draft a care plan or explain any specific risk factor in detail?`,
    citations,
  }
}

// Typewriter streaming effect
function useTypewriter(text: string, speed = 18, active = true) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return }
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(interval); setDone(true) }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, active])

  return { displayed, done }
}

function StreamingMessage({ content, citations }: { content: string; citations?: GuidelineEntry[] }) {
  const { displayed, done } = useTypewriter(content, 14, true)

  return (
    <div>
      <div
        className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap text-foreground",
          !done && "typing-cursor"
        )}
        dangerouslySetInnerHTML={{
          __html: displayed
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />')
        }}
      />
      {done && citations && citations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
          {citations.map((c) => (
            <HoverCard key={c.id} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium">
                  <BookOpen className="w-2.5 h-2.5" />
                  {c.source.split(" ").slice(0, 3).join(" ")}
                </button>
              </HoverCardTrigger>
              <HoverCardContent side="top" className="w-72 text-xs p-3" align="start">
                <div className="space-y-1.5">
                  <p className="font-semibold text-foreground text-[11px]">{c.source}</p>
                  <p className="text-primary text-[10px] font-medium">{c.section} · {c.year}</p>
                  <p className="text-muted-foreground leading-relaxed">{c.content}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      )}
    </div>
  )
}

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I'm your **Clinical Copilot**, powered by WHO NCD guidelines and evidence-based protocols.\n\nSelect a patient from the triage queue to begin a context-aware consultation, or ask me a general clinical question.",
  citations: [],
}

export function CopilotSidebar({
  patient,
  isOpen,
  onClose,
  pendingMessage,
  onPendingMessageConsumed,
}: CopilotSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 50)
  }

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isGenerating) return

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsGenerating(true)
      scrollToBottom()

      let responseText: string
      let citations: GuidelineEntry[] = []

      try {
        // --- Real RAG API call ---
        const ragResult = await api.generateRagInsights({
          bmi: patient?.vitals.bmi.value ?? 25,
          age: patient?.age ?? 40,
          high_bp: (patient?.vitals.bloodPressure.systolic ?? 0) >= 130 ? 1 : 0,
          high_chol: patient?.shapFeatures.some(
            (f) => f.feature.toLowerCase().includes("chol") && f.value > 0
          ) ? 1 : 0,
          smoker: patient?.shapFeatures.some(
            (f) => f.feature.toLowerCase().includes("smok") && f.value > 0
          ) ? 1 : 0,
          phys_activity: (patient?.vitals.physicalActivity.value ?? 0) >= 90 ? 1 : 0,
          hvy_alcohol: 0,
          ncd_risk_probability: (patient?.riskScore ?? 50) / 100,
          risk_tier:
            patient?.riskLevel === "critical" ? "High"
            : patient?.riskLevel === "warning" ? "Medium"
            : "Low",
        })

        // Format RAGInsightResponse into a readable message
        const factors = ragResult.primary_risk_factors.map((f) => `• ${f}`).join("\n")
        const guidelines = ragResult.clinical_guidelines.map((g) => `• ${g}`).join("\n")
        responseText =
          `${ragResult.analysis_summary}` +
          (factors ? `\n\n**Primary Risk Factors:**\n${factors}` : "") +
          (guidelines ? `\n\n**Clinical Guidelines:**\n${guidelines}` : "") +
          `\n\n**Recommended Action:** ${ragResult.recommended_action}`

        // Pull local citations for enrichment
        citations = retrieveGuidelines(
          text + (patient ? ` ${patient.primaryRiskFactor} BMI ${patient.vitals.bmi.value}` : ""),
          2
        )
      } catch {
        // Fallback to local mock if backend is unavailable
        const fallback = generateResponse(text, patient)
        responseText = fallback.text
        citations = fallback.citations
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: responseText,
        citations,
        isStreaming: true,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsGenerating(false)
      scrollToBottom()
    },
    [patient, isGenerating]
  )

  // Consume pending message from prompt pills
  useEffect(() => {
    if (pendingMessage && isOpen) {
      sendMessage(pendingMessage)
      onPendingMessageConsumed?.()
    }
  }, [pendingMessage, isOpen, sendMessage, onPendingMessageConsumed])

  // Context change notification
  useEffect(() => {
    if (patient) {
      const contextMsg: Message = {
        id: `ctx-${patient.id}`,
        role: "assistant",
        content: `Context updated — now consulting on **${patient.name}** (Risk Score: ${patient.riskScore}/100, Primary Factor: ${patient.primaryRiskFactor}). How can I help with their care?`,
        citations: [],
      }
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.id.startsWith("ctx-"))
        return [...filtered, contextMsg]
      })
    }
  }, [patient?.id])

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-card border-l border-border shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-muted/20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-risk-stable border border-card" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Clinical Copilot</p>
            {patient ? (
              <p className="text-[10px] text-primary">
                <ChevronRight className="inline w-2.5 h-2.5" />
                {patient.name.split(" ")[0]}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">No patient selected</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          aria-label="Close copilot"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                <Brain className="w-3 h-3 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2.5 text-xs",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/60 border border-border/50 rounded-bl-sm"
              )}
            >
              {msg.role === "assistant" && msg.isStreaming ? (
                <StreamingMessage content={msg.content} citations={msg.citations} />
              ) : msg.role === "assistant" ? (
                <div>
                  <div
                    className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                      {msg.citations.map((c) => (
                        <HoverCard key={c.id} openDelay={200} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <button className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-medium">
                              <BookOpen className="w-2.5 h-2.5" />
                              {c.source.split(" ").slice(0, 3).join(" ")}
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent side="top" className="w-72 text-xs p-3" align="start">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-foreground text-[11px]">{c.source}</p>
                              <p className="text-primary text-[10px] font-medium">{c.section} · {c.year}</p>
                              <p className="text-muted-foreground leading-relaxed">{c.content}</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Neural pulse loading indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-3 h-3 text-primary neural-pulse" />
            </div>
            <div className="bg-muted/60 border border-border/50 rounded-xl rounded-bl-sm px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary neural-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary neural-pulse" style={{ animationDelay: "200ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary neural-pulse" style={{ animationDelay: "400ms" }} />
                <span className="text-[10px] text-muted-foreground ml-1">Searching guidelines…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="px-3 py-2 bg-risk-warning/5 border-t border-risk-warning/20 shrink-0">
        <div className="flex items-start gap-1.5">
          <ShieldAlert className="w-3 h-3 text-risk-warning mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-risk-warning">Decision Support Tool:</span> AI-generated advice must be verified by a licensed healthcare professional.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border bg-muted/10 shrink-0">
        <div className="flex gap-2">
          <Textarea
            placeholder={patient ? `Ask about ${patient.name.split(" ")[0]}…` : "Ask a clinical question…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            rows={2}
            className="text-xs resize-none bg-background border-border focus-visible:ring-primary/50 min-h-0"
          />
          <Button
            size="icon"
            className="h-full aspect-square bg-primary hover:bg-primary/90 shrink-0"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isGenerating}
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <MessageSquare className="w-2.5 h-2.5 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Shift+Enter for new line · Enter to send</p>
        </div>
      </div>
    </aside>
  )
}
