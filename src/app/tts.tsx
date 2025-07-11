import { playPCMChunk } from './audio';

export async function tts(text: string) {
    const res = await fetch(`/api/tts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'audio/L16',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked',
            'Connection': 'keep-alive',
        },
        body: JSON.stringify({ text: text }),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch TTS audio');
    }
    const audioReader = res.body!.getReader();
    while (true) {
        const { done, value } = await audioReader.read();
        if (done) {
            break;
        }
        console.log('Received audio chunk',);
        console.log(value);
        playPCMChunk(value);
    }
}