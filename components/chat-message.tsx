"use client"

import { Card } from "@/components/ui/card"
import { Scale, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-slate-200" : "bg-indigo-100",
        )}
      >
        {isUser ? <User className="h-4 w-4 text-slate-700" /> : <Scale className="h-4 w-4 text-indigo-600" />}
      </div>
      <div className={cn("flex flex-1 flex-col", isUser && "items-end")}>
        <Card className={cn("max-w-[85%] p-4", isUser ? "bg-slate-100 text-slate-900" : "bg-white text-slate-900")}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </Card>
        <span className="mt-1 text-xs text-slate-500">
          {message.timestamp.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}
