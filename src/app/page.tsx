"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import LocationButton from "./location_button";
import { locationDistance, locationMarkerPropsToRelativeMarkerProps } from "./utils";
import { tts } from "./tts";
import { disableAudio, enableAudio, getMutedState } from "./audio";
const Map = dynamic(() => import("./map"), {
    ssr: false,
});

function updateMarkers(
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

export default function Home() {
    const [markers, setMarkers] = useState<Array<LocationMarkerProps>>([
        
    ]);
    const [muted, setMuted] = useState<boolean>(false);
    useEffect(() => {
        const initialMuted = getMutedState();
        setMuted(initialMuted);
    }, []);
    useEffect(() => {
        if (muted) {
            disableAudio();
        } else {
            enableAudio();
        }
    }, [muted]);

    const [aiDescription, setAiDescription] = useState<string>('');
    const [aiDescriptionLoading, setAiDescriptionLoading] = useState<boolean>(false);
    const [focusOn, setFocusOn] = useState<LocationMarkerProps | null>(null);
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
            useGeolocated({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                watchPosition: true,
                userDecisionTimeout: 5000,
            });
    const [oldLocation, setOldLocation] = useState<[number, number] | null>(null);
    const currentLocation: [number, number] | null = coords ? [coords.latitude, coords.longitude] as [number, number] : null;
    const locationThreshold = 500; // metres
    useEffect(() => {
        if (currentLocation !== null && (oldLocation === null || locationDistance(oldLocation, currentLocation) > locationThreshold)) {
            updateMarkers(setMarkers, setAiDescription, setAiDescriptionLoading, currentLocation);
            setOldLocation(currentLocation);
        }
    }, [currentLocation]);
    return (
        <div className="container">
            <div className="map-container">
                <Map 
                    currentLocation={currentLocation} 
                    focusOn={focusOn} 
                    setFocusOn={setFocusOn} 
                    markers={markers}
                />
            </div>
            <div className="marker-list-container">
                <button className="unmute-button"  onClick={() => setMuted(!muted)}>
                    <img src={muted ? "muted.svg" : "unmuted.svg"}
                        alt={muted ? "Unmute" : "Mute"}
                    />
                </button>
                <div className="marker-list">
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
                    <h2>Points of interest</h2>
                    {markers.map((marker, index) => (
                        <LocationButton 
                            currentLocation={currentLocation} 
                            marker={marker} 
                            focusOn={focusOn} 
                            setFocusOn={setFocusOn} 
                            key={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
