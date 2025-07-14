import { replayTTS, tts } from "./tts";
import { locationMarkerPropsToRelativeMarkerProps } from "./utils";

export function updateMarkers(
    setMarkers: (markers: Array<LocationMarkerProps>) => void,
    setAiDescription: (description: string) => void,
    setAiDescriptionLoading: (loading: boolean) => void,
    currentLocation: [number, number],
) {
    fetch(`/api/tripadvisor?lat=${currentLocation[0]}&long=${currentLocation[1]}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            const validMarkers = data.data
                .filter((item: MaybeLocationMarkerProps) => "error" in item === false )
                .sort((a: LocationMarkerProps, b: LocationMarkerProps) => {
                    return a.priority - b.priority;
                })
            setMarkers(validMarkers);
            
            updateAiDescription(setAiDescription, setAiDescriptionLoading, currentLocation, validMarkers);
        }).catch(error => {
            console.error('Error fetching data:', error);
        });
}

function updateAiDescription(
    setAiDescription: (description: string) => void,
    setAiDescriptionLoading: (loading: boolean) => void,
    currentLocation: [number, number],
    markers: Array<LocationMarkerProps>,
) {
    if (markers.length === 0) {
        return;
    }
    let query_data = markers.map(marker => {
        return locationMarkerPropsToRelativeMarkerProps(marker, currentLocation);
    })
    setAiDescriptionLoading(true);
    fetch('/api/describe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked',
            'Connection': 'keep-alive',
        },
        body: JSON.stringify(
            {
                "poi": query_data,
            }
        ),
    }).then(async response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        if (!response.body) {
            throw new Error('Response body is null');
        }
        setAiDescription('Thinking...');
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let currentDescription = '';
        let currentPhrase = '';
        let thinking = false;
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            let chunk = decoder.decode(value, { stream: true });
            if (chunk.startsWith("<think>")) {
                thinking = true;
                continue;
            } else if (chunk.includes("</think>")) {
                chunk = chunk.split("</think>")[1];
                thinking = false;
                if (!chunk) {
                    continue;
                }
            }
            if (!thinking) {
                currentPhrase += chunk;
                const endOfSentenceRegex = /(?<=[.!?])\s+/;
                let sentences = currentPhrase.split(endOfSentenceRegex);
                for (let s of sentences.slice(0, -1)) {
                    tts(s);
                }
                currentPhrase = sentences[sentences.length - 1];
                currentDescription += chunk;
                setAiDescription(currentDescription);
            }
        }
        setAiDescriptionLoading(false);
        if (currentPhrase && currentPhrase.trim().length > 0) {
            tts(currentPhrase);
        } 
    }).catch(error => {
        console.error('Error fetching LLM data:', error);
        setAiDescriptionLoading(false);
        setAiDescription('Error generating AI description.');
    });
}

export function AiOverview({
    aiDescription,
    aiDescriptionLoading,
}: {
    aiDescription: string,
    aiDescriptionLoading: boolean,
}) {
    return (
        <div className="ai-description-container" onClick={() => replayTTS(aiDescription, aiDescriptionLoading)}>
            <div className="ai-description-container-wrapper">        
                <h2>Overview</h2>
                <div className="ai-description">
                    <p className={"ai-description-text " + (aiDescriptionLoading ? "loading": "")}>
                    {aiDescription ? aiDescription : (
                        aiDescriptionLoading ?
                            "Loading AI description..." :
                            "No AI description available."
                    )}
                    </p>
                </div>
            </div>
        </div>
    )
}