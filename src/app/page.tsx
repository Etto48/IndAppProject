"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import LocationButton from "./location_button";
import { locationDistance } from "./utils";
import { disableAudio, enableAudio, getMutedState } from "./audio";
import { updateMarkers } from "./ai_overview";
import { replayTTS } from "./tts";
import { getIPLocation } from "./geolocation";
const Map = dynamic(() => import("./map"), {
    ssr: false,
});

export default function Home() {
    const [markers, setMarkers] = useState<Array<LocationMarkerProps>>([
        
    ]);
    const [muted, setMuted] = useState<boolean>(true);
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
    const [ipLocation, setIPLocation] = useState<[number, number] | null>(null);
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
            useGeolocated({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                watchPosition: true,
                userDecisionTimeout: 5000,
                onError: (error) => {
                    if (ipLocation === null) {
                        getIPLocation().then(location => {
                            setIPLocation(location);
                        }).catch(err => {
                            console.error('Error fetching IP location:', err);
                        });
                    }
                },
            });
    const [oldLocation, setOldLocation] = useState<[number, number] | null>(null);
    let currentLocation: [number, number] | null = coords ? [coords.latitude, coords.longitude] as [number, number] : ipLocation;
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
                    <div className="ai-description-container" onClick={() => replayTTS(aiDescription, aiDescriptionLoading)}>
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
