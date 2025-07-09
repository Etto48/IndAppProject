"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import LocationButton from "./location_button";
import { locationDistance, locationMarkerPropsToRelativeMarkerProps } from "./utils";
const Map = dynamic(() => import("./map"), {
    ssr: false,
});

function updateMarkers(
    setMarkers: (markers: Array<LocationMarkerProps>) => void,
    setAiDescription: (description: string) => void,
    currentLocation: [number, number]
) {
    fetch(`/api/tripadvisor?lat=${currentLocation[0]}&long=${currentLocation[1]}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            const validMarkers = data.data
                .filter((item: { location: [number, number] | null, category: string | null }) => item.location !== null && item.category !== null)
                .map((item: { location: [number, number]; name: string, category: string }) => ({
                    position: item.location,
                    category: item.category || 'unknown',
                    name: item.name,
                }));
            setMarkers(validMarkers);
            
            updateAiDescription(setAiDescription, currentLocation, validMarkers);
        }).catch(error => {
            console.error('Error fetching data:', error);
        });
}

function updateAiDescription(
    setAiDescription: (description: string) => void,
    currentLocation: [number, number],
    markers: Array<LocationMarkerProps>
) {
    if (markers.length === 0) {
        return;
    }
    let query_data = markers.map(marker => {
        return locationMarkerPropsToRelativeMarkerProps(marker, currentLocation);
    })
    fetch('/api/describe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            {
                "poi": query_data,
            }
        ),
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    }).then(data => {
        setAiDescription(data);
    }).catch(error => {
        console.error('Error fetching LLM data:', error);
    });
}

export default function Home() {
    const [markers, setMarkers] = useState<Array<LocationMarkerProps>>([
        
    ]);
    const [aiDescription, setAiDescription] = useState<string>('');
    const [focusOn, setFocusOn] = useState<[number, number] | null>(null);
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
            updateMarkers(setMarkers, setAiDescription, currentLocation);
            setOldLocation(currentLocation);
        }
    }, [currentLocation]);
    return (
        <div className="container">
            <div className="map-container">
                <Map currentLocation={currentLocation} focusOn={focusOn} setFocusOn={setFocusOn} markers={markers}/>
            </div>
            <div className="marker-list-container">
                <div className="marker-list">
                    <h2>Markers</h2>
                    {markers.map((marker, index) => (
                        <LocationButton currentLocation={currentLocation} marker={marker} key={index} setFocusOn={setFocusOn}/>
                    ))}
                    <h2>AI Description</h2>
                    <div className="ai-description">
                        {aiDescription ? (
                            <p>{aiDescription}</p>
                        ) : (
                            <p>Loading AI description...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
