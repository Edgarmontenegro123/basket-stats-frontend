import type {AIGatewayResponse, AIFunctionDeclaration, ChatMessage} from '../types/chat'
import {aiFunctionDeclarations, executeAITool} from './aiTools'

const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'https://147.15.10.181.nip.io/analytics'
const MODEL_NAME = 'meta-llama/llama-3.3-70b-instruct'

const SYSTEM_INSTRUCTION = `You are Swish, an intelligent basketball tactical assistant.

CORE RULES:
- Assume capitalized words, proper nouns, or informal names (e.g., 'almendra', 'capitan') refer to basketball teams or players in the system.

- ALWAYS execute available tools to search for data before declaring that information is missing.

- Handle accent marks and case variations gracefully.

- Only refuse queries that are completely unrelated to sports/basketball.


RESPONSE & FORMATTING RULES:
- Keep text responses extremely short and direct (maximum 1 or 2 short sentences) when showing visual cards.

- NEVER display internal database IDs (UUIDs).

- NEVER mention internal tool or function names to the user.

- Do NOT use large headers (#, ##, ###) or long bullet point lists when visual components are available.`


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
        const response = await fetch(`${ANALYTICS_API_URL}/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
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

                combinedResults[functionName] = toolResult

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
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
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
        console.error('Error connecting to AI gateway:', error)
        return {
            text: 'Error de conexión con el servidor de IA.'
        }
    }
}