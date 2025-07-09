import { NextApiRequest, NextApiResponse } from 'next';
import { Ollama } from 'ollama';

const targetUrl = 'http://localhost:11434/';
const modelName = 'deepseek-r1:1.5b';
const ollama = new Ollama({
    host: targetUrl,
})


function createPrompt({poi}: {poi: Array<RelativeMarkerProps>}): string {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }   
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache'); 
    try {
        const response = await ollama.generate({
            model: modelName,
            prompt: createPrompt(req.body),
            stream: true,
        });
        
        let thinking = false;
        for await (const chunk of response) {
            if (chunk.response === '<think>') {
                thinking = true;
                continue;
            } else if (chunk.response === '</think>') {
                thinking = false;
                continue;
            }
            if (!thinking) {
                res.write(chunk.response);
            }
        }
        res.end();

    } catch (error) {
        console.error('Error generating response:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};