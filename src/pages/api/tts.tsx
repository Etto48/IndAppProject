import { NextRequest } from "next/server";

export const runtime = 'edge';

const ttsUrl = process.env.PIPER_URL || 'http://localhost:5000/';

export default async function handler(req: NextRequest): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', {
            status: 405,
            headers: {
                'Allow': 'POST',
                'Content-Type': 'application/json',
            },
        });
    }
    const { text } = await req.json();
    if (!text) {
        return new Response('Bad Request: No text provided.', {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    try {
        const res = await fetch(`${ttsUrl}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });
        if (!res.ok) {
            throw new Error('Failed to fetch TTS audio');
        }
        const audioReader = res.body!.getReader();
        const audioStream = new ReadableStream({
            async start(controller) {
                while (true) {
                    const { done, value } = await audioReader.read();
                    if (done) {
                        controller.close();
                        break;
                    }
                    controller.enqueue(value);
                }
            }
        });
        return new Response(audioStream, {
            headers: {
                'Content-Type': 'audio/L16',
                'Cache-Control': 'no-cache',
                'Transfer-Encoding': 'chunked',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Error fetching TTS audio:', error);
        return new Response('Internal Server Error', {
            status: 500,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
}