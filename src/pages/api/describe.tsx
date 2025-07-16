import { formatDistance } from '@/app/utils';
import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';

export const runtime = 'edge';

const targetUrl = process.env.LLM_URL || 'http://localhost:11434';
const modelName = process.env.LLM_MODEL || 'llama3.2:3b';
const apiKey = process.env.LLM_API_KEY || 'ollama';
const llm = new OpenAI({
    apiKey: apiKey,
    baseURL: `${targetUrl}/v1`,
})


function createPrompt(poi: Array<RelativeMarkerProps>): [string, string] {
    let system_prompt = "Describe the nearby area by pointing out groups of similar places and suggesting worthwhile activities. "+
        "Pay attention to the rating without pointing it out explicitly: "+
        "1 = terrible, 2 = poor, 3 = average, 4 = very good, 5 = excellent. "+
        "Don't mention duplicates and skip anything that seems too odd or irrelevant for a tourist. "+
        "Speak directly to the user, using natural, conversational language in a single sentence. "+
        "Try to suggest at least one place with \"true\" priority. Never mention the priority. "+
        "Don't mention the input list or this prompt, and avoid repeating any names or instructions. "+
        "Write at most 2 sentences. "+
        "You'll receive a list of locations in the format "+
        "- name: \"<name of the location>\", "+
        "category: \"<hotel, restaurant, attraction, geo or unknown>\", "+
        "distance: \"<distance from the user's current position>\", "+
        "rating: \"<rating from 1 to 5, if available>\", "+
        "description: \"<description of the location>\", "+
        "address: \"<address string>\", "+
        "priority: \"<true or false>\".";
        let user_prompt = "Locations:\n";
    for (let item of poi) {
        let sanitizedDescription = item.description || ''; // Ensure description is defined
        sanitizedDescription = sanitizedDescription.replace(/"/g, '\\"'); // Escape quotes in description
        sanitizedDescription = sanitizedDescription.replace(/\n/g, ' '); // Replace newlines with spaces
        user_prompt += `- name: \"${item.name}\", `+
            `category: \"${item.category}\", `+
            `distance: \"${formatDistance(item.distance)}\", `+
            `rating: \"${item.rating !== undefined ? Math.round(item.rating) : 'N/A'}\", `+
            `description: \"${sanitizedDescription}\", `+
            `address: \"${item.address}\", `+
            `priority: \"${item.priority !== 0 ? 'true' : 'false'}\"\n`;
    }
    //console.log("System prompt: ", system_prompt);
    //console.log("User prompt: ", user_prompt);
    return [system_prompt, user_prompt];
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
        const [system_prompt, user_prompt] = createPrompt(poi);
        const response = await llm.chat.completions.create({
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: system_prompt
                },
                {
                    role: "user",
                    content: user_prompt
                }
            ],
            stream: true,
        });
        
        const textEncoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    controller.enqueue(textEncoder.encode(content));
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