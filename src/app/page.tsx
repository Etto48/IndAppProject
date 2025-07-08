"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
const Map = dynamic(() => import("./map"), {
    ssr: false,
});

export default function Home() {
    const [markers, setMarkers] = useState<Array<{ position: [number, number], popupText: string }>>([
        
    ]);
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
            useGeolocated({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                watchPosition: true,
                userDecisionTimeout: 5000,
            });
    const currentLocation: [number, number] = coords ? [coords.latitude, coords.longitude] as [number, number] : [51.505, -0.09];
    return (
        <div className="container">
            <div className="map-container">
                <Map currentLocation={currentLocation} markers={markers}/>
            </div>
            <div className="marker-list-container">
                <div className="marker-list">
                    <h2>Markers</h2>
                    <ul>
                        {markers.map((marker, index) => (
                            <li key={index}>
                                <strong>Marker {index + 1}:</strong> {marker.popupText} at {marker.position[0]}, {marker.position[1]}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
