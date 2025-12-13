"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Send, PanelLeftClose, PanelLeft, Plus, Scale } from "lucide-react"
import { ChatMessage } from "@/components/chat-message"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `## Summary Analysis\n\n**Facts:**\nThe system has received your query and would process it using RAG-based court judgement analysis.\n\n**Issues:**\nThis is a demo interface. Backend integration required for actual legal document processing.\n\n**Reasoning:**\nThe interface is designed to accept court judgement text or legal queries and return structured summaries.\n\n**Verdict:**\nReady for integration with your RAG model and legal database.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 2000)
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600">
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>
            <Scale className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900">LexBrief AI</h1>
              <p className="text-xs text-slate-600">Court Judgement Summarization & Precedent Finder</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn("border-r border-slate-200 bg-white transition-all duration-300", sidebarOpen ? "w-64" : "w-0")}
        >
          <div className={cn("flex h-full flex-col p-4", !sidebarOpen && "hidden")}>
            <Button
              onClick={handleNewChat}
              className="mb-4 w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <div className="flex-1">
              <h3 className="mb-3 text-sm font-medium text-slate-600">Recent Chats</h3>
              <div className="space-y-2">
                <Card className="cursor-pointer p-3 hover:bg-slate-50">
                  <p className="truncate text-sm text-slate-700">Previous chat history</p>
                  <p className="text-xs text-slate-500">Would appear here</p>
                </Card>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col">
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {messages.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                  <Scale className="mb-4 h-16 w-16 text-slate-300" />
                  <h2 className="mb-2 text-2xl font-semibold text-slate-700">Welcome to LexBrief AI</h2>
                  <p className="mb-6 max-w-md text-slate-600">
                    Paste court judgement text or ask legal research queries to receive AI-generated summaries from
                    authenticated precedents.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className="cursor-pointer p-4 hover:bg-slate-50">
                      <p className="text-sm font-medium text-slate-700">Summarize Judgement</p>
                      <p className="text-xs text-slate-500">Get structured case analysis</p>
                    </Card>
                    <Card className="cursor-pointer p-4 hover:bg-slate-50">
                      <p className="text-sm font-medium text-slate-700">Find Precedents</p>
                      <p className="text-xs text-slate-500">Search relevant case law</p>
                    </Card>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                        <Scale className="h-4 w-4 text-indigo-600" />
                      </div>
                      <Card className="flex-1 p-4">
                        <div className="space-y-2">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                        </div>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white px-4 py-4">
            <div className="mx-auto max-w-4xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste court judgement text or ask a legal query..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-[60px] w-[60px] bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <footer className="border-t border-slate-200 bg-slate-50 px-4 py-2">
            <p className="mx-auto max-w-4xl text-center text-xs text-slate-600">
              This system provides AI-generated summaries for research purposes only and does not constitute legal
              advice.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
