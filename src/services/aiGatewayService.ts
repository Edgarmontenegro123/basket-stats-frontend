import type {AIGatewayResponse, AIFunctionDeclaration, ChatMessage} from '../types/chat'
import type {OpenRouterMessage} from '../types/ai'
import {aiFunctionDeclarations, executeAITool} from './aiTools'

const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || (import.meta.env.DEV ? 'http://localhost:8081' : 'https://147.15.10.181.nip.io/analytics')
const MODEL_NAME = 'meta-llama/llama-3.3-70b-instruct:free'

const SYSTEM_INSTRUCTION = `You are Swish, a warm, concise, and reliable basketball tactical assistant.

STRICT DATA INTEGRITY (CRITICAL):
- NEVER invent, guess, or estimate scores, points, rebounds, assists, or player performances.
- Whenever the user asks about ANY match, team, or player (including follow-up questions like "what about X vs Y?" or "are you sure?"), you MUST call the appropriate tool first to verify the exact numbers from the database.
- Only cite numbers explicitly returned by the tools. If a stat is not in the tool output, state clearly that you do not have that figure.

PERSONALITY & CONCISENESS:
- Be friendly, human, and insightful, like a sharp basketball coach—never robotic.
- Keep ALL responses brief and punchy: maximum 2 to 3 short sentences per reply (around 40-65 words total).
- When a visual card is displayed, briefly interpret the key takeaway (strengths, weakness, or turning point) instead of listing every number on the card.
- End with at most one short, natural follow-up question.

LANGUAGE RULES (HIGHEST PRIORITY):
- Always match the language of the user's LATEST message, ignoring the language of earlier messages in the chat history.
- If the latest message is in English, reply strictly in British English (e.g. 'analyse', 'defence', 'offence', 'match', 'colour').
- If the latest message is in Spanish, reply strictly in natural Spanish.

FORMATTING RULES:
- NEVER display internal database IDs (UUIDs) or internal tool/function names.`

const detectTargetLanguage = (text: string): 'en' | 'es' => {
    const clean = text.toLowerCase()
    const englishMarkers = /\b(the|what|about|how|are|you|can|show|first|last|game|match|team|player|points|sure|did|just|between|with|for|stats|statistics|analysis|analyse)\b/
    const spanishMarkers = /\b(el|la|los|las|que|como|cómo|puedes|primer|ultimo|último|partido|equipo|jugador|puntos|seguro|entre|con|para|estadisticas|estadísticas|hola|buenas)\b/

    const enMatches = (clean.match(new RegExp(englishMarkers, 'g')) || []).length
    const esMatches = (clean.match(new RegExp(spanishMarkers, 'g')) || []).length

    if (enMatches > esMatches) return 'en'
    return 'es'
}

export const sendMessageToGateway = async(userMessage: string, chatHistory: ChatMessage[] = []): Promise<AIGatewayResponse> => {
    const targetLang = detectTargetLanguage(userMessage)
    const langDirective = targetLang === 'en'
        ? '\n\n[Language instruction: Reply strictly in British English.]'
        : '\n\n[Instrucción de idioma: Responde estrictamente en español.]'

    const recentHistory = chatHistory
        .filter((msg) => msg.id !== 'init-1' && (msg.text.trim() !== '' || Boolean(msg.genUiData)))
        .slice(-6)
        .map((msg) => ({
            role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.text.trim() !== '' ? msg.text : '[Visual card displayed]'
        }))

    const messages: OpenRouterMessage[] = [
        {
            role: 'system',
            content: SYSTEM_INSTRUCTION
        },
        ...recentHistory
    ]

    if (recentHistory.length === 0 || recentHistory[recentHistory.length - 1].content !== userMessage) {
        messages.push({
            role: 'user',
            content: `${userMessage}${langDirective}`
        })
    } else {
        messages[messages.length - 1] = {
            role: 'user',
            content: `${userMessage}${langDirective}`
        }
    }

    const typedDeclarations = aiFunctionDeclarations as unknown as AIFunctionDeclaration[]

    const tools = typedDeclarations.map((tool) => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters || {}
        }
    }))

    try {
        const response = await fetch(`${ANALYTICS_API_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('basket_stats_token') || ''}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages,
                tools,
                tool_choice: 'auto',
                temperature: 0.2
            })
        })

        if (!response.ok) {
            return {
                text: `Error de API (${response.status}): No se pudo conectar con el servidor.`
            }
        }

        const data = await response.json()
        const choice = data.choices?.[0]
        const message = choice?.message as OpenRouterMessage

        if (message?.tool_calls && message.tool_calls.length > 0) {
            messages.push(message)

            let extractedGenUiData: unknown = undefined

            for (const toolCall of message.tool_calls) {
                const functionName = toolCall.function.name
                const functionArgs = JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>

                console.log(`🤖 OpenRouter requested tool execution: ${functionName}`, functionArgs)
                const toolResult = (await executeAITool(functionName, functionArgs)) as Record<string, unknown>

                if (toolResult && typeof toolResult === 'object') {
                    if ('genUiData' in toolResult && toolResult.genUiData) {
                        extractedGenUiData = toolResult.genUiData
                    } else if ('type' in toolResult && toolResult.type === 'match-card') {
                        extractedGenUiData = toolResult
                    }
                }

                const toolContent =
                    toolResult && typeof toolResult === 'object' && 'result' in toolResult
                        ? toolResult.result
                        : JSON.stringify(toolResult)

                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: typeof toolContent === 'string' ? toolContent : JSON.stringify(toolContent)
                })
            }

            const secondResponse = await fetch(`${ANALYTICS_API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('basket_stats_token') || ''}`
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages,
                    temperature: 0.2
                })
            })

            const secondData = await secondResponse.json()
            const finalReply = secondData.choices?.[0]?.message?.content

            return {
                text: finalReply && finalReply.trim() !== '' ? finalReply : '',
                genUiData: extractedGenUiData as ChatMessage['genUiData']
            }
        }

        if (!message?.content || message.content.trim() === '') {
            const fallbackResponse = await fetch(`${ANALYTICS_API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('basket_stats_token') || ''}`
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages,
                    temperature: 0.3
                })
            })

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json()
                const fallbackContent = fallbackData.choices?.[0]?.message?.content
                if (fallbackContent && fallbackContent.trim() !== '') {
                    return {text: fallbackContent}
                }
            }
        }

        return {
            text: message?.content || (targetLang === 'en'
                ? 'Hello! I am doing great. Which team, match, or player would you like to analyse today?'
                : '¡Hola! Todo muy bien por aquí. ¿Sobre qué equipo, partido o jugador te gustaría analizar estadísticas hoy?')
        }
    } catch (error) {
        console.error('Error connecting to AI gateway:', error)
        return {
            text: 'Error de conexión con el servidor de IA.'
        }
    }
}