import type {ChatMessage} from '../types/chat'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_INSTRUCTION = `You are Basket Stats AI, a specialized tactical assistant for basketball coaches and analysts.
Your ONLY domain is basketball, team statistics, player performance, game recaps, and tactical analysis.
If the user asks about any topic outside of basketball (such as cooking, general news, politics, or coding), politely inform them that you can only assist with basketball analytics and team stats.`

export type {ChatMessage}

export const sendMessageToGemini = async(userMessage: string, contextData?: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
        return 'Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.'
    }

    const promptText = contextData
        ? `System Instruction: ${SYSTEM_INSTRUCTION}\n\nCurrent Team/Game Data Context:\n${contextData}\n\nUser Question: ${userMessage}`
        : `System Instruction: ${SYSTEM_INSTRUCTION}\n\nUser Question: ${userMessage}`

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: promptText
                            }
                        ]
                    }
                ]
            })
        })

        if (!response.ok) {
            console.error(`API error status: ${response.status}`)
            return 'Sorry, the assistant is having trouble connecting to the server right now.'
        }

        const data = await response.json()
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        return reply || 'No response received from Basket Stats AI.'
    } catch (error) {
        console.error('Error connecting to Gemini API:', error)
        return 'Sorry, I could not process your request at this time. Please try again.'
    }
}