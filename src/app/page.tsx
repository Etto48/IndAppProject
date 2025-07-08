"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
const Map = dynamic(() => import("./map"), {
    ssr: false,
});

export default function Home() {
    const [currentLocation, setCurrentLocation] = useState<[number, number]>([51.505, -0.09]);
    const [markers, setMarkers] = useState<Array<{ position: [number, number], popupText: string }>>([
        { position: [51.51, -0.1], popupText: "Marker 1" },
        { position: [51.52, -0.11], popupText: "Marker 2" },
        { position: [51.53, -0.12], popupText: "Marker 3" },
        { position: [51.54, -0.13], popupText: "Marker 4" },
        { position: [51.55, -0.14], popupText: "Marker 5" },
    ]);
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
