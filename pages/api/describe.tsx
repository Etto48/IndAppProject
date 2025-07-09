import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { RelativeMarkerProps } from '../../src/app/types';

export const runtime = 'edge';

const modelName = 'gpt-4o-mini';
const openAiApiKey = process.env.OPENAI_API_KEY || '';

const openai = new OpenAI({
    apiKey: openAiApiKey,
    // baseURL: 'http://localhost:11434/', // for ollama
});


function createPrompt({poi}: {poi: RelativeMarkerProps[]}): string {
    let prompt = "Briefly tell the user in a conversational tone what kind of locations there are nearby. "+
        "Directly speak to the user without any preamble or introduction. Do not repeat the instructions. "+
        "You will be provided a list of locations with each entry in the format "+
        "\"- name: <name of the location>, "+
        "category: <hotel, restaurant, attraction, geo or unknown>, "+
        "distance: <distance in meters>m, "+
        "description: <description of the location>\". "+
        "Locations:\n";
    for (let item of poi) {
        prompt += `- name: ${item.name}, category: ${item.category}, distance: ${item.distance}m, description: ${item.description}\n`;
    }

    return prompt;
}

export default async function handler(req: NextRequest) {
    if (req.method !== 'POST') {
        return new Response(`Method ${req.method} Not Allowed`, {
            status: 405,
            headers: {
                Allow: 'POST',
            },
        });
    }

    try {
        const body = await req.json();
        const stream = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: 'user', content: createPrompt(body) }],
            stream: true,
        });

        const responseStream = new ReadableStream({
            async start(controller) {
                let thinking = false;
                for await (const chunk of stream) {
                    const content = chunk.choices?.[0]?.delta?.content;
                    if (content === '<think>') {
                        thinking = true;
                        continue;
                    } else if (content === '</think>') {
                        thinking = false;
                        continue;
                    }
                    if (!thinking && content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            },
        });

        return new Response(responseStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('Error generating response:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}