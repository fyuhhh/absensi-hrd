"use client";

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface OfficeMapProps {
    lat: number;
    lng: number;
    radius: number;
    userLat?: number;
    userLng?: number;
}

export default function OfficeMap({ lat, lng, radius, userLat, userLng }: OfficeMapProps) {
    const officePosition: [number, number] = [lat, lng];
    const userPosition: [number, number] | null = userLat && userLng ? [userLat, userLng] : null;

    const officeIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const userIcon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    return (
        <div className="h-full w-full">
            <MapContainer
                center={userPosition ?? officePosition}
                zoom={16}
                style={{ width: "100%", height: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Circle
                    center={officePosition}
                    radius={radius}
                    pathOptions={{
                        color: "blue",
                        fillColor: "blue",
                        fillOpacity: 0.1,
                    }}
                >
                    <Popup>
                        <div>
                            <b>Kantor</b>
                            <br />
                            Radius: {radius} meter
                        </div>
                    </Popup>
                </Circle>
                <Marker position={officePosition} icon={officeIcon}>
                    <Popup>
                        <b>Lokasi Kantor</b>
                        <br />
                        {lat}, {lng}
                    </Popup>
                </Marker>
                {userPosition && (
                    <Marker position={userPosition} icon={userIcon}>
                        <Popup>
                            <b>Lokasi Pengguna</b>
                            <br />
                            {userLat}, {userLng}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
