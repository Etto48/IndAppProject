"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import LocationButton from "./location_button";
import { locationDistance } from "./utils";
import { disableAudio, enableAudio, getMutedState } from "./audio";
import { AiOverview, updateMarkers } from "./ai_overview";
import { getIPLocation } from "./geolocation";
import FilterButtons from "./filter_buttons";
const Map = dynamic(() => import("./map"), {
    ssr: false,
});

export default function Home() {
    const [markers, setMarkers] = useState<Array<LocationMarkerProps>>([
        
    ]);
    const [muted, setMuted] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('all');
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
    const [ipLocation, setIpLocation] = useState<[number, number] | null>(null);
    const [requestedIpLocation, setRequestedIpLocation] = useState<boolean>(false);

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
                onError: (error) => {
                    console.warn("Geolocation error: ", error ? error.message : "Timeout");
                    if (!requestedIpLocation) {
                        setRequestedIpLocation(true);
                        getIPLocation().then((info) => {
                            setIpLocation(info);
                        }).catch((error) => {
                            console.error("Error getting IP location: ", error);
                        });
                    }
                }
            });
    const [oldLocation, setOldLocation] = useState<[number, number] | null>(null);
    let currentLocation: [number, number] | null = coords ? [coords.latitude, coords.longitude] as [number, number] : ipLocation;
    let accuracy = coords ? coords.accuracy : 0;
    const locationThreshold = 250; // metres
    useEffect(() => {
        if (currentLocation !== null && (oldLocation === null || locationDistance(oldLocation, currentLocation) > locationThreshold)) {
            updateMarkers(setMarkers, setAiDescription, setAiDescriptionLoading, currentLocation);
            setOldLocation(currentLocation);
        }
    }, [currentLocation]);

    const filteredMarkers = markers.filter(marker => filter === 'all' || marker.category === filter);

    return (
        <div className="container">
            <div className="map-container">
                <Map
                    currentLocation={currentLocation}
                    focusOn={focusOn}
                    setFocusOn={setFocusOn}
                    markers={filteredMarkers}
                    accuracy={accuracy}
                />
            </div>
            <div className="marker-list-container">
                <FilterButtons filter={filter} setFilter={setFilter} />
                <button className="unmute-button"  onClick={() => setMuted(!muted)}>
                    <div className="unmute-button-wrapper">
                        <img src={muted ? "muted.svg" : "unmuted.svg"}
                            alt={muted ? "Unmute" : "Mute"}
                        />
                    </div>
                </button>
                <div className="marker-list">
                    <AiOverview aiDescription={aiDescription} aiDescriptionLoading={aiDescriptionLoading} />
                    <h2 className="poi-title">Points of interest</h2>
                    {filteredMarkers.map((marker, index) => (
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
