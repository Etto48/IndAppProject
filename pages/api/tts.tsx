import { NextRequest } from "next/server";

export const runtime = 'edge';

export default async function handler(req: NextRequest): Promise<Response> {
    const ttsUrl = process.env.PIPER_URL || 'http://localhost:5000/';
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', {
            status: 405,
            headers: {
                'Allow': 'GET',
                'Content-Type': 'text/plain',
            },
        });
    }
    const text = req.nextUrl.searchParams.get('text');
    if (!text) {
        return new Response('Bad Request: No text provided.', {
            status: 400,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    }
    try {
        const encodedText = encodeURIComponent(text);
        const res = await fetch(`${ttsUrl}/predict?text=${encodedText}`, {
            method: 'GET',
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