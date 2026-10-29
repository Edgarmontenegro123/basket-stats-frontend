import type {AIGatewayResponse, AIFunctionDeclaration} from '../types/chat'
import {aiFunctionDeclarations, executeAITool} from './aiTools'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL_NAME = 'meta-llama/llama-3.3-70b-instruct'

const SYSTEM_INSTRUCTION = `You are Swish, a specialized tactical assistant for basketball coaches and analysts.
Your ONLY domain is basketball, team statistics, player performance, game recaps, and tactical analysis.
If the user asks about any topic outside of basketball, politely inform them that you can only assist with basketball analytics.

FORMATTING RULES FOR CHAT WIDGET:
- Keep answers concise, clean, and minimal.
- Do NOT use large headers like #, ##, or ###. Use bold text for labels (e.g., **Final Score:**).
- Do NOT use horizontal dividers (---).
- Use bullet points (*) or short lines for stats.
- Keep responses compact for a small chat window.`

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

export const sendMessageToGateway = async(userMessage: string): Promise<AIGatewayResponse> => {
    if (!OPENROUTER_API_KEY) {
        return {
            text: 'OpenRouter API Key is missing. Please add VITE_OPENROUTER_API_KEY to your .env file.'
        }
    }

    const messages: OpenRouterMessage[] = [
        {
            role: 'system',
            content: SYSTEM_INSTRUCTION
        },
        {
            role: 'user',
            content: userMessage
        }
    ]

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
            const errorData = await response.json().catch(() => ({}))
            console.error('OpenRouter API Error:', response.status, errorData)
            return {
                text: `Error de API (${response.status}): No se pudo conectar con el proveedor alternativo.`
            }
        }

        const data = await response.json()
        const choice = data.choices?.[0]
        const message = choice?.message as OpenRouterMessage

        if (message?.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0]
            const functionName = toolCall.function.name
            const functionArgs = JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>

            console.log(`🤖 OpenRouter requested tool execution: ${functionName}`, functionArgs)
            const toolResult = await executeAITool(functionName, functionArgs)
            console.log('📊 Tool execution result:', toolResult)

            messages.push(message)
            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(toolResult)
            })

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
            const finalReply = secondData.choices?.[0]?.message?.content || 'Consulta completada.'

            return {
                text: finalReply,
                genUiData: toolResult
            }
        }

        return {
            text: message?.content || 'No response received from Swish.'
        }
    } catch (error) {
        console.error('Error connecting to OpenRouter:', error)
        return {
            text: 'Error de conexión con el proveedor de IA.'
        }
    }
}