"use client"

import { Card } from "@/components/ui/card"
import { Scale, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function formatToBulletPoints(text: string): string {
  // First, split by paragraphs (double newlines or single newlines)
  const paragraphs = text.split(/\n\n+/)
  
  let allBullets: string[] = []
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue
    
    // Split paragraph by sentence endings (. ! ?)
    const sentences = paragraph
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 0)
    
    // Group sentences into pairs
    for (let i = 0; i < sentences.length; i += 2) {
      const sentencePair = sentences.slice(i, i + 2).join(" ").trim()
      if (sentencePair) {
        allBullets.push(sentencePair)
      }
    }
  }
  
  // Format as markdown list with proper spacing
  return allBullets.map(bullet => `• ${bullet}`).join("\n\n")
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const [displayedContent, setDisplayedContent] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!isUser && message.content) {
      setIsTyping(true)
      setDisplayedContent("")
      
      // Format content into bullet points
      const formattedContent = formatToBulletPoints(message.content)
      
      let currentIndex = 0
      const typingSpeed = 10
      
      const intervalId = setInterval(() => {
        if (currentIndex < formattedContent.length) {
          setDisplayedContent(formattedContent.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsTyping(false)
          clearInterval(intervalId)
        }
      }, typingSpeed)

      return () => clearInterval(intervalId)
    } else {
      setDisplayedContent(message.content)
    }
  }, [message.content, isUser])

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-muted" : "bg-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-foreground" />
        ) : (
          <Scale className="h-4 w-4 text-primary animate-pulse" />
        )}
      </div>
      <div className={cn("flex flex-1 flex-col", isUser && "items-end")}>
        <Card className={cn(
          "max-w-[85%] p-4 transition-all",
          isUser 
            ? "bg-muted" 
            : "bg-card shadow-[0_0_20px_rgba(168,85,247,0.15)] border-primary/20"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-serif">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none font-serif leading-relaxed
              prose-headings:text-foreground prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-4 
              prose-headings:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-p:text-foreground prose-p:mb-3 prose-p:leading-relaxed
              prose-p:drop-shadow-[0_0_3px_rgba(168,85,247,0.2)]
              prose-strong:text-primary prose-strong:font-bold 
              prose-strong:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]
              prose-em:text-primary/90 prose-em:italic
              prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-foreground prose-li:mb-2 prose-li:leading-relaxed
              prose-li:drop-shadow-[0_0_3px_rgba(168,85,247,0.2)]
              prose-li::marker:text-primary prose-li::marker:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-primary 
              prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 
              prose-code:rounded prose-code:font-mono prose-code:text-sm
              prose-a:text-primary prose-a:underline prose-a:font-semibold
              prose-a:drop-shadow-[0_0_5px_rgba(168,85,247,0.4)]
              prose-hr:border-primary/30 prose-hr:my-4
            ">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="animate-[glow_2s_ease-in-out_infinite]" {...props} />,
                  h2: ({node, ...props}) => <h2 className="animate-[glow_2s_ease-in-out_infinite]" {...props} />,
                  h3: ({node, ...props}) => <h3 className="animate-[glow_2s_ease-in-out_infinite]" {...props} />,
                  strong: ({node, ...props}) => <strong className="animate-[glow_2s_ease-in-out_infinite]" {...props} />,
                }}
              >
                {displayedContent}
              </ReactMarkdown>
              {isTyping && <span className="inline-block w-1 h-4 ml-1 bg-primary animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}
            </div>
          )}
        </Card>
        <span className="mt-1 text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}