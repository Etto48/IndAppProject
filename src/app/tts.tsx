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
    let audioBuffer = new Uint8Array(0);
    while (true) {
        const { done, value } = await audioReader.read();
        if (done) {
            break;
        }
        audioBuffer = new Uint8Array([...audioBuffer, ...value]);
    }
    playPCMChunk(audioBuffer);
}

export function replayTTS(text: string, loading: boolean) {
    if (loading) {
        return;
    }
    tts(text).catch(error => {
        console.error('Error during TTS replay:', error);
    });
}