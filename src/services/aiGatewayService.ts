import type {AIGatewayResponse, AIFunctionDeclaration, ChatMessage} from '../types/chat'
import type {OpenRouterMessage} from '../types/ai'
import {aiFunctionDeclarations, executeAITool} from './aiTools'

const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || (import.meta.env.DEV ? 'http://localhost:8081' : 'https://147.15.10.181.nip.io/analytics')
const MODEL_NAME = 'meta-llama/llama-3.3-70b-instruct:free'

const SYSTEM_INSTRUCTION = `You are Swish, a warm, insightful, and conversational basketball tactical assistant and sports analyst.

PERSONALITY & TONE:
- Be approachable, natural, and genuinely helpful—like a knowledgeable basketball coach or analyst chatting with a colleague.
- When the user greets you (e.g., "Hola", "How are you?"), respond warmly and naturally in their language, and invite them to explore team stats, match results, or player analysis.
- Never sound robotic or merely dump raw numbers. Always interpret the stats: highlight strengths, areas for improvement, tactical impact, and context.
- When a visual card (match card, player card, or comparison card) is displayed alongside your message, write a concise, engaging tactical commentary (2 to 4 sentences) explaining what the numbers mean rather than repeating every single stat on the card.

LANGUAGE RULES:
- Detect the language of the user's latest message and reply strictly in that same language.
- If the user writes in English, you MUST respond in British English (use British spelling and terminology such as 'analyse', 'defence', 'offence', 'match', 'colour').
- If the user writes in Spanish, you MUST respond in natural, fluent Spanish.
- If the language is ambiguous (e.g., only a team or player name), default to Spanish.

CORE RULES:
- Assume capitalized words, proper nouns, or informal names (e.g., 'almendra', 'capitan', 'pegasos') refer to basketball teams or players in the system.
- ALWAYS execute available tools to search for real data before answering questions about teams, matches, or players.
- Handle accent marks, typos, and case variations gracefully.
- Politely steer off-topic questions back to basketball analytics without sounding rigid.

FORMATTING RULES:
- NEVER display internal database IDs (UUIDs).
- NEVER mention internal tool or function names to the user.
- Keep paragraphs clean and readable; use bolding sparingly for key tactical insights.`

export const sendMessageToGateway = async(userMessage: string, chatHistory: ChatMessage[] = []): Promise<AIGatewayResponse> => {
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
            content: userMessage
        })
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
                tool_choice: 'auto'
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
                    messages
                })
            })

            const secondData = await secondResponse.json()
            const finalReply = secondData.choices?.[0]?.message?.content

            return {
                text: finalReply && finalReply.trim() !== '' ? finalReply : '',
                genUiData: extractedGenUiData as ChatMessage['genUiData']
            }
        }

        // Si el modelo devolvió contenido vacío (ej. en saludos simples con tools activos), reintentamos como conversación pura
        if (!message?.content || message.content.trim() === '') {
            const fallbackResponse = await fetch(`${ANALYTICS_API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('basket_stats_token') || ''}`
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages
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
            text: message?.content || '¡Hola! Todo muy bien por aquí. ¿Sobre qué equipo, partido o jugador te gustaría analizar estadísticas hoy?'
        }
    } catch (error) {
        console.error('Error connecting to AI gateway:', error)
        return {
            text: 'Error de conexión con el servidor de IA.'
        }
    }
}