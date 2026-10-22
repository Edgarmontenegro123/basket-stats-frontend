import type {ChatMessage} from '../types/chat'
import {aiFunctionDeclarations, executeAITool} from './aiTools'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_INSTRUCTION = `You are Basket Stats AI, a specialized tactical assistant for basketball coaches and analysts.
Your ONLY domain is basketball, team statistics, player performance, game recaps, and tactical analysis.
If the user asks about any topic outside of basketball (such as cooking, general news, politics, or coding), politely inform them that you can only assist with basketball analytics and team stats.`

export type {ChatMessage}

export const sendMessageToGemini = async(userMessage: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
        return 'Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file and restart Vite.'
    }

    const initialPayload = {
        contents: [
            {
                parts: [
                    {
                        text: `System Instruction: ${SYSTEM_INSTRUCTION}\n\nUser Question: ${userMessage}`
                    }
                ]
            }
        ],
        tools: [
            {
                functionDeclarations: aiFunctionDeclarations
            }
        ]
    }

    try {
        // 1. Primer envío a Gemini con la lista de Tools
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(initialPayload)
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Gemini API Error Response:', response.status, errorData)
            return `API Error (${response.status}): ${errorData?.error?.message || 'Check browser console for details.'}`
        }

        const data = await response.json()
        const candidate = data.candidates?.[0]?.content?.parts?.[0]

        // 2. Comprobar si Gemini solicita ejecutar una función (Function Call)
        if (candidate?.functionCall) {
            const {name, args} = candidate.functionCall
            console.log(`🤖 Agent requested tool execution: ${name}`, args)

            // Ejecutar la función real de nuestro api.ts
            const toolResult = await executeAITool(name, args)

            // 3. Segundo envío a Gemini entregando la respuesta de la Tool
            const followUpPayload = {
                contents: [
                    {
                        role: 'user',
                        parts: [{text: userMessage}]
                    },
                    {
                        role: 'model',
                        parts: [{functionCall: candidate.functionCall}]
                    },
                    {
                        role: 'function',
                        parts: [
                            {
                                functionResponse: {
                                    name,
                                    response: {result: toolResult}
                                }
                            }
                        ]
                    }
                ]
            }

            const followUpResponse = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(followUpPayload)
            })

            if (!followUpResponse.ok) {
                return 'Failed to process tool results with Gemini.'
            }

            const followUpData = await followUpResponse.json()
            return followUpData.candidates?.[0]?.content?.parts?.[0]?.text || 'No final answer generated.'
        }

        // Si no requirió herramientas, devolvemos el texto directo
        return candidate?.text || 'No response received from Basket Stats AI.'
    } catch (error) {
        console.error('Error connecting to Gemini API:', error)
        return 'Sorry, I could not process your request at this time. Please check your network connection.'
    }
}