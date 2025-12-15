"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, PanelLeftClose, PanelLeft, Plus, Scale, Trash2 } from "lucide-react"
import { ChatMessage } from "@/components/chat-message"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  precedents?: Array<{
    case_name: string
    excerpt: string
  }>
}

type ChatHistory = {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('lexbrief_chat_history')
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      // Convert timestamp strings back to Date objects
      const history = parsed.map((chat: any) => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
      setChatHistory(history)
    }
  }, [])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('lexbrief_chat_history', JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Save current chat when messages change
  useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const title = messages[0]?.content.substring(0, 50) || "New Chat"
      setChatHistory(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === currentChatId)
        const updatedChat: ChatHistory = {
          id: currentChatId,
          title,
          messages,
          timestamp: new Date()
        }
        
        if (existingIndex >= 0) {
          const newHistory = [...prev]
          newHistory[existingIndex] = updatedChat
          return newHistory
        } else {
          return [updatedChat, ...prev]
        }
      })
    }
  }, [messages, currentChatId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Create new chat if this is the first message
    if (!currentChatId) {
      setCurrentChatId(Date.now().toString())
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          top_k: 5
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.explanation || "No explanation provided",
        timestamp: new Date(),
        precedents: data.precedents || []
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please make sure the backend server is running.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setInput("")
    setCurrentChatId(null)
  }

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      setCurrentChatId(chatId)
    }
  }

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) {
      handleNewChat()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-transparent">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>
            <Scale className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">LexBrief AI</h1>
              <p className="text-xs text-muted-foreground">Court Judgement Summarization & Precedent Finder</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn("border-r bg-card/80 backdrop-blur-md transition-all duration-300", sidebarOpen ? "w-64" : "w-0")}
        >
          <div className={cn("flex h-full flex-col p-4", !sidebarOpen && "hidden")}>
            <Button
              onClick={handleNewChat}
              className="mb-4 w-full justify-start gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <div className="flex-1 overflow-y-auto">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Recent Chats</h3>
              <div className="space-y-2">
                {chatHistory.length === 0 ? (
                  <Card className="p-3">
                    <p className="text-sm text-muted-foreground text-center">No chat history yet</p>
                  </Card>
                ) : (
                  chatHistory.map((chat) => (
                    <Card
                      key={chat.id}
                      className={cn(
                        "cursor-pointer p-3 hover:bg-accent transition-colors group",
                        currentChatId === chat.id && "bg-accent"
                      )}
                      onClick={() => loadChat(chat.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm text-foreground">{chat.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {chat.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => deleteChat(chat.id, e)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {messages.length === 0 ? (
                <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                  <Scale className="mb-4 h-16 w-16 text-muted-foreground/50" />
                  <h2 className="mb-2 text-2xl font-semibold text-foreground">Welcome to LexBrief AI</h2>
                  <p className="mb-6 max-w-md text-muted-foreground">
                    Paste court judgement text or ask legal research queries to receive AI-generated summaries from
                    authenticated precedents.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className="cursor-pointer p-4 hover:bg-accent">
                      <p className="text-sm font-medium text-foreground">Summarize Judgement</p>
                      <p className="text-xs text-muted-foreground">Get structured case analysis</p>
                    </Card>
                    <Card className="cursor-pointer p-4 hover:bg-accent">
                      <p className="text-sm font-medium text-foreground">Find Precedents</p>
                      <p className="text-xs text-muted-foreground">Search relevant case law</p>
                    </Card>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <ChatMessage message={message} />
                      {message.role === "assistant" && message.precedents && message.precedents.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h3 className="text-sm font-semibold text-foreground">Relevant Precedents:</h3>
                          {message.precedents.map((precedent, idx) => (
                            <Card key={idx} className="p-4 bg-accent/50 border-primary/30">
                              <p className="text-sm font-medium text-primary mb-2">
                                {precedent.case_name.replace(/_/g, ' ').replace('.PDF', '')}
                              </p>
                              <p className="text-xs text-muted-foreground italic">&quot;{precedent.excerpt.substring(0, 300)}...&quot;</p>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                        <Scale className="h-4 w-4 text-primary" />
                      </div>
                      <Card className="flex-1 p-4">
                        <div className="space-y-2">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                        </div>
                      </Card>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t bg-card/80 backdrop-blur-md px-4 py-4">
            <div className="mx-auto max-w-4xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste court judgement text or ask a legal query..."
                  className="min-h-[60px] resize-none bg-background"
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
                  className="h-[60px] w-[60px] bg-primary hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <footer className="border-t bg-background/50 backdrop-blur-sm px-4 py-2">
            <p className="mx-auto max-w-4xl text-center text-xs text-muted-foreground">
              This system provides AI-generated summaries for research purposes only and does not constitute legal
              advice.
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}