import type {AIGatewayResponse, AIFunctionDeclaration, ChatMessage} from '../types/chat'
import {aiFunctionDeclarations, executeAITool} from './aiTools'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL_NAME = 'meta-llama/llama-3.3-70b-instruct'

const SYSTEM_INSTRUCTION = `You are Swish, an intelligent basketball tactical assistant.

CORE RULES:
- Assume capitalized words, proper nouns, or informal names (e.g., 'almendra', 'capitan') refer to basketball teams or players in the system.
- ALWAYS execute available tools to search for data before declaring that information is missing.
- Handle accent marks and case variations gracefully (e.g., 'capitan' matches 'Capitán El Espacio').
- Only refuse queries that are completely unrelated to sports/basketball.

RESPONSE & PRIVACY RULES:
- NEVER display internal database IDs (UUIDs).
- NEVER mention internal tool or function names to the user.
- When giving a team or player summary, display available metrics clearly. If a player is not found, state clearly that the player has no recorded stats.

FORMATTING RULES:
- Keep answers concise, clean, and minimal.
- Do NOT use large headers (#, ##, ###) or horizontal dividers (---).
- Use bold text for labels and clear bullet points for stats.`

interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant' | 'tool'
    content?: string
    tool_calls?: Array<{
        id: string
        function: {
            name: string
            arguments: string
        }
    }>
    tool_call_id?: string
}

export const sendMessageToGateway = async(userMessage: string, chatHistory: ChatMessage[] = []): Promise<AIGatewayResponse> => {
    if (!OPENROUTER_API_KEY) {
        return {
            text: 'OpenRouter API Key is missing. Please add VITE_OPENROUTER_API_KEY to your .env file.'
        }
    }

    const recentHistory = chatHistory
        .filter((msg) => msg.id !== 'init-1')
        .slice(-6)
        .map((msg) => ({
            role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.text
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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Basket Stats AI'
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
            const combinedResults: Record<string, unknown> = {}

            for (const toolCall of message.tool_calls) {
                const functionName = toolCall.function.name
                const functionArgs = JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>

                console.log(`🤖 OpenRouter requested tool execution: ${functionName}`, functionArgs)
                const toolResult = (await executeAITool(functionName, functionArgs)) as {
                    result?: string
                    genUiData?: unknown
                }

                if (toolResult && typeof toolResult === 'object' && 'genUiData' in toolResult && toolResult.genUiData) {
                    extractedGenUiData = toolResult.genUiData
                }

                const toolContent =
                    toolResult && typeof toolResult === 'object' && 'result' in toolResult
                        ? toolResult.result
                        : JSON.stringify(toolResult)

                combinedResults[functionName] = toolResult

                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: typeof toolContent === 'string' ? toolContent : JSON.stringify(toolContent)
                })
            }

            const secondResponse = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Basket Stats AI'
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages
                })
            })

            const secondData = await secondResponse.json()
            const finalReply = secondData.choices?.[0]?.message?.content

            return {
                text: finalReply && finalReply.trim() !== '' ? finalReply : 'Consulta procesada exitosamente.',
                genUiData: extractedGenUiData as ChatMessage['genUiData']
            }
        }

        return {
            text: message?.content || 'No se obtuvo respuesta de Swish.'
        }
    } catch (error) {
        console.error('Error connecting to OpenRouter:', error)
        return {
            text: 'Error de conexión con el servidor de IA.'
        }
    }
}