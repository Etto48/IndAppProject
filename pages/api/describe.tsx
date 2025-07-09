import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { Ollama } from 'ollama/browser';

export const runtime = 'edge';

const targetUrl = 'http://localhost:11434/';
const modelName = 'llama3.2:3b';
const ollama = new Ollama({
    host: targetUrl,
})


function createPrompt(poi: Array<RelativeMarkerProps>): string {
    let prompt = "Briefly explain what kind of locations there are nearby, highlighting high concentrations "+
        "of the same kind of structures and suggest what activities might be worth doing in this place. "+
        "Ignore duplicates and locations that seem too strange or irrelevant for a tourist. "+
        "Directly speak to the user without any preamble or introduction. Do not repeat the instructions "+
        "nor the exact list that will follow. Do not make any explicit reference to the list or the prompt. "+
        "Respond with a single sentence that summarizes the information and would be suitable for spoken language. "+
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
        return new Response('Method Not Allowed', {
            status: 405,
            headers: {
                'Allow': 'POST',
                'Content-Type': 'text/plain',
            },
        });
    }
    const body = await req.json();
    const poi = body.poi as Array<RelativeMarkerProps>;
    if (!poi || poi.length === 0) {
        return new Response('Bad Request: No points of interest provided.', {
            status: 400,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
    try {
        const response = await ollama.generate({
            model: modelName,
            prompt: createPrompt(poi),
            stream: true,
        });
        
        const textEncoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    controller.enqueue(textEncoder.encode(chunk.response));
                }
                controller.close();
            }
        });
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Error generating response:', error);
        return new Response('Internal Server Error', {
            status: 500,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
};