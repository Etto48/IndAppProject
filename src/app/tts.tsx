import { playPCMChunk } from './audio';

export async function tts(text: string) {
    const encodedText = encodeURIComponent(text);
    const res = await fetch(`/api/tts?text=${encodedText}`, {
        method: 'GET',
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