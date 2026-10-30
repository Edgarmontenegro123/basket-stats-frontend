import {useState, useRef, useEffect} from 'react'
import ReactMarkdown from 'react-markdown'
import {sendMessageToGateway} from '../../services/aiGatewayService'
import type {ChatMessage, GenUiPayload, PlayerCardData} from '../../types/chat'
import {PlayerCard} from '../genui/PlayerCard'
import './ChatWidget.css'

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'init-1',
            sender: 'bot',
            text: 'Hello! I´m Swish. How can I help you with team analytics today?',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }

    useEffect(() => {
        if (isOpen) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [input])

    const handleSend = async() => {
        if (!input.trim() || isLoading) return

        const userText = input.trim()
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: userText,
            timestamp: new Date()
        }

        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setIsLoading(true)

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        const gatewayResponse = await sendMessageToGateway(userText, updatedMessages)

        const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: gatewayResponse.text,
            timestamp: new Date(),
            genUiData: gatewayResponse.genUiData
        }

        setMessages([...updatedMessages, botMessage])
        setIsLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            void handleSend()
        }
    }

    const renderGenUiComponent = (genUiData: GenUiPayload) => {
        switch (genUiData.type) {
            case 'player-card':
                return <PlayerCard data={genUiData.data as PlayerCardData & { teamBadgeUrl?: string; photoUrl?: string }} />
            default:
                return null
        }
    }

    return (
        <div className='chat-widget-container'>
            {isOpen && (
                <div className='chat-window'>
                    <div className='chat-header'>
                        <div className='chat-header-title'>
                            <span>🏀 Swish</span>
                        </div>
                        <button className='chat-close-btn' onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>

                    <div className='chat-messages'>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message ${msg.sender}`}>
                                {msg.sender === 'bot' ? (
                                    <div className='markdown-content'>
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        {msg.genUiData && renderGenUiComponent(msg.genUiData)}
                                    </div>
                                ) : (
                                    <span>{msg.text}</span>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className='chat-message bot'>
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className='chat-input-area'>
                        <textarea
                            ref={textareaRef}
                            className='chat-input'
                            placeholder='Ask about stats or tactics...'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={1}
                        />
                        <button
                            className='chat-send-btn'
                            onClick={() => void handleSend()}
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