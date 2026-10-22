import type {ChatMessage} from '../types/chat'
import {aiFunctionDeclarations, executeAITool} from './aiTools'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const MODEL_NAME = 'gemini-3.8-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_INSTRUCTION = `You are Swish, a specialized tactical assistant for basketball coaches and analysts.
Your ONLY domain is basketball, team statistics, player performance, game recaps, and tactical analysis.
If the user asks about any topic outside of basketball, politely inform them that you can only assist with basketball analytics.

FORMATTING RULES FOR CHAT WIDGET:
- Keep answers concise, clean, and minimal.
- Do NOT use large headers like #, ##, or ###. Use bold text for labels (e.g., **Final Score:**).
- Do NOT use horizontal dividers (---).
- Use bullet points (*) or short lines for stats.
- Keep responses compact for a small chat window.`
export type {ChatMessage}

const fetchWithRetry = async(url: string, options: RequestInit, retries = 3, delayMs = 1500): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url, options)
        if (response.ok || (response.status !== 503 && response.status !== 429)) {
            return response
        }
        if (i < retries - 1) {
            console.warn(`⚠️ Gemini API returned ${response.status}. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`)
            await new Promise((resolve) => setTimeout(resolve, delayMs))
            delayMs *= 2
        } else {
            return response
        }
    }
    return fetch(url, options)
}

export const sendMessageToGemini = async(userMessage: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
        return 'Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file and restart Vite.'
    }

    const userPart = {
        text: `System Instruction: ${SYSTEM_INSTRUCTION}\n\nUser Question: ${userMessage}`
    }

    const contents: Array<Record<string, unknown>> = [
        {
            role: 'user',
            parts: [userPart]
        }
    ]

    const maxTurns = 4
    let currentTurn = 0

    try {
        while (currentTurn < maxTurns) {
            currentTurn++

            const payload = {
                contents,
                tools: [
                    {
                        functionDeclarations: aiFunctionDeclarations
                    }
                ]
            }

            const response = await fetchWithRetry(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('Gemini API Error Response:', response.status, errorData)
                if (response.status === 503) {
                    return 'El servicio de IA está experimentando alta demanda momentánea. Por favor, reintenta en unos segundos.'
                }
                return `API Error (${response.status}): ${errorData?.error?.message || 'Check browser console for details.'}`
            }

            const data = await response.json()
            const modelContent = data.candidates?.[0]?.content
            const candidateParts = modelContent?.parts || []

            // Buscamos si la respuesta contiene una solicitud de ejecución de función
            const functionCallPart = candidateParts.find((part: {functionCall?: unknown}) => part.functionCall)

            if (functionCallPart?.functionCall) {
                const {name, args} = functionCallPart.functionCall
                console.log(`🤖 Agent requested tool execution (Turn ${currentTurn}): ${name}`, args)

                const toolResult = await executeAITool(name, args)
                console.log('📊 Tool execution result:', toolResult)

                // Agregamos al historial la respuesta del modelo y el resultado entregado por el usuario
                contents.push(modelContent)
                contents.push({
                    role: 'user',
                    parts: [
                        {
                            functionResponse: {
                                name,
                                response: {
                                    name,
                                    content: toolResult
                                }
                            }
                        }
                    ]
                })

                // Continuamos el bucle para enviar el resultado de vuelta a Gemini
                continue
            }

            // Si no hay más llamadas a funciones, extraemos el texto devuelto
            const textPieces: string[] = []
            for (const part of candidateParts) {
                if (part.text) {
                    textPieces.push(part.text)
                }
            }

            const finalReply = textPieces.join('\n\n')

            if (finalReply) {
                return finalReply
            }

            return candidateParts?.[0]?.text || 'No response received from Swish.'
        }

        return 'Maximum turn limit reached while processing tool executions.'
    } catch (error) {
        console.error('Error connecting to Gemini API:', error)
        return 'Sorry, I could not process your request at this time. Please check your network connection.'
    }
}