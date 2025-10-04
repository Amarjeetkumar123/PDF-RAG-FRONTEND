'use client'

import React from 'react'

interface MessageContentProps {
    content: string
    isUser: boolean
}

const MessageContent: React.FC<MessageContentProps> = ({ content, isUser }) => {
    // Function to format text with enhanced markdown-like styling
    const formatContent = (text: string) => {
        // Split by double newlines to create paragraphs
        const paragraphs = text.split('\n\n')
        
        return paragraphs.map((paragraph, index) => {
            // Handle code blocks (```code```)
            if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
                const code = paragraph.slice(3, -3).trim()
                return (
                    <pre key={index} className={`p-4 rounded-lg overflow-x-auto my-3 ${
                        isUser 
                            ? 'bg-blue-700 text-blue-100' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}>
                        <code className="text-sm font-mono whitespace-pre">{code}</code>
                    </pre>
                )
            }
            
            // Handle inline code (`code`)
            const formattedParagraph = paragraph.split('`').map((part, partIndex) => {
                if (partIndex % 2 === 1) {
                    // This is code
                    return (
                        <code key={partIndex} className={`px-2 py-1 rounded text-sm font-mono ${
                            isUser 
                                ? 'bg-blue-700 text-blue-100' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}>
                            {part}
                        </code>
                    )
                }
                return part
            })
            
            // Handle bold text (**text**)
            const boldFormatted = formattedParagraph.map((part, partIndex) => {
                if (typeof part === 'string') {
                    return part.split('**').map((boldPart, boldIndex) => {
                        if (boldIndex % 2 === 1) {
                            return <strong key={`${partIndex}-${boldIndex}`} className="font-semibold">{boldPart}</strong>
                        }
                        return boldPart
                    })
                }
                return part
            })
            
            // Handle italic text (*text*)
            const italicFormatted = boldFormatted.map((part, partIndex) => {
                if (typeof part === 'string') {
                    return (part as string).split('*').map((italicPart, italicIndex) => {
                        if (italicIndex % 2 === 1) {
                            return <em key={`${partIndex}-${italicIndex}`} className="italic">{italicPart}</em>
                        }
                        return italicPart
                    })
                }
                return part
            })
            
            // Handle lists (lines starting with - or *)
            if (paragraph.includes('\n-') || paragraph.includes('\n*')) {
                const lines = paragraph.split('\n')
                const listItems = lines.filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
                
                if (listItems.length > 0) {
                    return (
                        <div key={index} className="my-3">
                            {listItems.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start gap-3 my-2">
                                    <span className={`mt-1 font-bold ${
                                        isUser ? 'text-blue-200' : 'text-gray-500'
                                    }`}>•</span>
                                    <span className="flex-1 leading-relaxed">{item.replace(/^[-*]\s*/, '')}</span>
                                </div>
                            ))}
                        </div>
                    )
                }
            }
            
            // Handle numbered lists
            if (paragraph.includes('\n1.') || paragraph.includes('\n2.') || paragraph.includes('\n3.')) {
                const lines = paragraph.split('\n')
                const numberedItems = lines.filter(line => /^\d+\./.test(line.trim()))
                
                if (numberedItems.length > 0) {
                    return (
                        <div key={index} className="my-3">
                            {numberedItems.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start gap-3 my-2">
                                    <span className={`mt-1 font-semibold ${
                                        isUser ? 'text-blue-200' : 'text-gray-500'
                                    }`}>{itemIndex + 1}.</span>
                                    <span className="flex-1 leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</span>
                                </div>
                            ))}
                        </div>
                    )
                }
            }
            
            // Handle headers (lines starting with #)
            if (paragraph.startsWith('#')) {
                const headerLevel = paragraph.match(/^#+/)?.[0].length || 1
                const headerText = paragraph.replace(/^#+\s*/, '')
                
                const headerProps = {
                    key: index,
                    className: `font-bold my-3 ${
                        headerLevel === 1 ? 'text-lg' : 
                        headerLevel === 2 ? 'text-base' : 'text-sm'
                    }`
                }
                
                switch (Math.min(headerLevel, 6)) {
                    case 1: return <h1 {...headerProps}>{headerText}</h1>
                    case 2: return <h2 {...headerProps}>{headerText}</h2>
                    case 3: return <h3 {...headerProps}>{headerText}</h3>
                    case 4: return <h4 {...headerProps}>{headerText}</h4>
                    case 5: return <h5 {...headerProps}>{headerText}</h5>
                    case 6: return <h6 {...headerProps}>{headerText}</h6>
                    default: return <h1 {...headerProps}>{headerText}</h1>
                }
            }
            
            return (
                <p key={index} className="my-2 leading-relaxed whitespace-pre-wrap">
                    {italicFormatted}
                </p>
            )
        })
    }

    return (
        <div className={`px-4 py-4 rounded-2xl shadow-sm ${
            isUser
                ? 'bg-blue-600 text-white ml-auto'
                : 'bg-white border border-slate-200 text-slate-900'
        }`}>
            <div className="prose prose-sm max-w-none">
                {formatContent(content)}
            </div>
        </div>
    )
}

export default MessageContent
