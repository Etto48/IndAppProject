"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import LocationButton from "./location_button";
import { locationDistance } from "./utils";
const Map = dynamic(() => import("./map"), {
    ssr: false,
});

export default function Home() {
    const [markers, setMarkers] = useState<Array<LocationMarkerProps>>([
        
    ]);
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
            fetch(`/api/tripadvisor?lat=${currentLocation[0]}&long=${currentLocation[1]}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                }).then(data => {
                    console.log('Fetched data:', data);
                    data.data.forEach((item: { location: [number, number] | null; name: string, category: string | null }) => {
                        const validMarkers = data.data
                            .filter((item: { location: [number, number] | null, category: string | null }) => item.location !== null && item.category !== null)
                            .map((item: { location: [number, number]; name: string, category: string }) => ({
                                position: item.location,
                                category: item.category || 'unknown',
                                name: item.name,
                            }));
                        setMarkers(validMarkers);
                    });
                }).catch(error => {
                    console.error('Error fetching data:', error);
                });
            setOldLocation(currentLocation);
            console.log("Current location updated:", currentLocation);
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
                    <ul>
                        {markers.map((marker, index) => (
                            <LocationButton currentLocation={currentLocation} marker={marker} key={index} setFocusOn={setFocusOn}/>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
