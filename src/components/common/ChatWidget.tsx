import {useState, useRef, useEffect} from 'react'
import {sendMessageToGemini} from '../../services/geminiService'
import type {ChatMessage} from '../../types/chat'
import './ChatWidget.css'

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([
        {sender: 'assistant', text: 'Hello! I am Basket Stats AI. How can I help you with team analytics today?'}
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    const handleSend = async() => {
        if (!input.trim() || isLoading) return

        const userText = input.trim()
        const newMessages: ChatMessage[] = [...messages, {sender: 'user', text: userText}]

        setMessages(newMessages)
        setInput('')
        setIsLoading(true)

        const responseText = await sendMessageToGemini(userText)

        setMessages([...newMessages, {sender: 'assistant', text: responseText}])
        setIsLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend()
        }
    }

    return (
        <div className='chat-widget-container'>
            {isOpen && (
                <div className='chat-window'>
                    <div className='chat-header'>
                        <div className='chat-header-title'>
                            <span>🏀 Basket Stats AI</span>
                        </div>
                        <button className='chat-close-btn' onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>

                    <div className='chat-messages'>
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className='chat-message assistant'>
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className='chat-input-area'>
                        <input
                            type='text'
                            className='chat-input'
                            placeholder='Ask about stats or tactics...'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <button
                            className='chat-send-btn'
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            ➔
                        </button>
                    </div>
                </div>
            )}

            <button
                className='chat-toggle-btn'
                onClick={() => setIsOpen(!isOpen)}
                aria-label='Toggle Chat Assistant'
            >
                💬
            </button>
        </div>
    )
}