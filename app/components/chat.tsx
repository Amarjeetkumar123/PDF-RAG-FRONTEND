'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, Trash2 } from 'lucide-react'
import ReferenceViewer from './reference-dock-viewer'
import MessageContent from './message-content'
import { UserButton } from '@clerk/nextjs'

interface IDocuments {
    pageContent?: string
    metadata: {
        source?: string
        loc?: { pageNumber?: number }
    }
}

interface IMessage {
    role: 'user' | 'assistant'
    content?: string
    documents?: IDocuments[]
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = useState<string>('')
    const [messages, setMessages] = useState<IMessage[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [showScrollButton, setShowScrollButton] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)
    const isFirstRender = useRef(true)

    // Load messages from localStorage on component mount
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages')
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages)
                setMessages(parsedMessages)
            } catch (error) {
                console.error('Error parsing saved messages:', error)
            }
        }
    }, [])

    // Save messages to localStorage whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages))
        }
    }, [messages])

    const handleSend = async () => {
        if (!message.trim()) return

        // Add user message
        setMessages((prev) => [...prev, { role: 'user', content: message }])
        setMessage('')
        setIsTyping(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat?message=${message}`)
            const data = await response.json()

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.message,
                    documents: data?.docs || [],
                },
            ])
        } catch (error) {
            console.error('Error fetching assistant response:', error)
        } finally {
            setIsTyping(false)
        }
    }

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: isFirstRender.current ? 'auto' : 'smooth',
            })
            isFirstRender.current = false
        }
    }, [messages, isTyping])

    // Detect scroll to show/hide button
    useEffect(() => {
        const handleScroll = () => {
            if (!messagesContainerRef.current) return
            const { scrollTop, scrollHeight, clientHeight } =
                messagesContainerRef.current

            const atBottom = scrollHeight - scrollTop - clientHeight < 50
            setShowScrollButton(!atBottom)
        }

        const container = messagesContainerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll)
            }
        }
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const clearChat = () => {
        setMessages([])
        localStorage.removeItem('chatMessages')
    }

    return (
        <div className="relative flex flex-col h-screen">
            <div className="flex items-center justify-between p-4 lg:px-6 lg:pt-6">
                <h2 className="text-base lg:text-lg font-semibold mb-4 text-slate-800">PDF Chat</h2>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearChat}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                    <UserButton />
                </div>
            </div>
            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide px-4 lg:px-8 py-6 space-y-6"
            >
                {messages.map((msg, index) => {
                    const isUser = msg.role === 'user'

                    return (
                        <div
                            key={index}
                            className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {/* Avatar */}
                            {!isUser && (
                                <Avatar>
                                    <AvatarImage src="/assistant.png" alt="AI" />
                                    <AvatarFallback className="bg-emerald-500 text-white">AI</AvatarFallback>
                                </Avatar>
                            )}

                            <div className="max-w-[80%] flex flex-col gap-2">
                                <MessageContent 
                                    content={msg.content || ''} 
                                    isUser={isUser} 
                                />

                                {/* TODO:Show references only for assistant messages */}
                                {/* {msg.role === 'assistant' && msg.documents?.length ? (
                                    <ReferenceViewer documents={msg.documents} />
                                ) : null} */}
                            </div>

                            {isUser && (
                                <Avatar>
                                    <AvatarImage src="/user.png" alt="You" />
                                    <AvatarFallback className="bg-blue-400 text-white">U</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    )
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar>
                            <AvatarImage src="/assistant.png" alt="AI" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                            <div className="flex items-center gap-1">
                                <span className="dot"></span>
                                <span className="dot [animation-delay:200ms]"></span>
                                <span className="dot [animation-delay:400ms]"></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Floating Scroll Button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="absolute z-50 bottom-20 right-6 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
                >
                    <ChevronDown className="h-5 w-5" />
                </button>
            )}

            {/* Input Bar */}
            <div className="sticky bottom-0 w-full border-t bg-white/80 backdrop-blur-md px-4 py-3">
                <div className="mx-auto max-w-3xl flex items-end gap-2 rounded-xl border border-slate-200 bg-white shadow-sm p-2">
                    <Input
                        placeholder="Ask me anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        disabled={message.trim().length === 0}
                        onClick={handleSend}
                    >
                        Send
                    </Button>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 text-center">
                    AI may produce inaccurate information. Verify important details.
                </p>
            </div>

            {/* Tailwind custom animation */}
            <style jsx global>{`
        @keyframes pulseDots {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
        .dot {
          width: 0.5rem;
          height: 0.5rem;
          background-color: rgb(156 163 175); /* slate-400 */
          border-radius: 9999px;
          animation: pulseDots 1.4s infinite ease-in-out;
        }
      `}</style>
        </div>
    )
}

export default ChatComponent
