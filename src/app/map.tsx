'use client'
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";


type MapViewProps = {
    currentLocation: [number, number];
    markers?: Array<{ position: [number, number], popupText: string }>;
};

const currentLocationIcon = new Icon({
    iconUrl: './current_location.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

const hotelIcon = new Icon({
    iconUrl: './hotel.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

function DetectMapDrag({ setMapMoved }: { setMapMoved: (moved: boolean) => void }) {
    const events = useMapEvents({
        drag: () => {
            setMapMoved(true);
        }
    })
    return null;
}

export default function Map({currentLocation, markers}: MapViewProps) {
    const [centerMap, setCenterMap] = useState(false);
    const [mapMoved, setMapMoved] = useState(false);
    const [oldLocation, setOldLocation] = useState<[number, number]>(currentLocation);
    useEffect(() => {
        if (!mapMoved && (currentLocation[0] !== oldLocation[0] || currentLocation[1] !== oldLocation[1])) {
            setCenterMap(!centerMap);
            setOldLocation(currentLocation);
        }
    }, [currentLocation])
    return (
        <>
        <MapContainer center={currentLocation} zoom={13} className="map" key={centerMap ? "reset" : "default"}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={currentLocation} icon={currentLocationIcon}>
                <Popup>
                    You are here!
                </Popup>
            </Marker>
            {markers && markers.map((marker, index) => (
                <Marker key={index} position={marker.position} icon={hotelIcon}>
                    <Popup>
                        {marker.popupText}
                    </Popup>
                </Marker>
            ))}
            <DetectMapDrag setMapMoved={setMapMoved}/>
        </MapContainer>
        <button className={"reset-view-button" + (mapMoved? " active" : "")} onClick={() => {
            setCenterMap(!centerMap);
            setMapMoved(false);
        }}>Reset map</button>
        </>
    );
}
