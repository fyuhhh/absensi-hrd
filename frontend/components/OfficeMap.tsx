"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import ReactMapGL, { Marker, NavigationControl, Source, Layer, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, User, Eye, Layers } from "lucide-react";

interface OfficeMapProps {
    lat: number;
    lng: number;
    radius: number;
    userLat?: number;
    userLng?: number;
}

function makeCircle(lng: number, lat: number, r: number) {
    const pts = 80;
    const dx = r / (111320 * Math.cos(lat * Math.PI / 180));
    const dy = r / 110574;
    const coords = Array.from({ length: pts + 1 }, (_, i) => {
        const t = (i / pts) * 2 * Math.PI;
        return [lng + dx * Math.cos(t), lat + dy * Math.sin(t)];
    });
    return {
        type: "FeatureCollection" as const,
        features: [{
            type: "Feature" as const,
            geometry: { type: "Polygon" as const, coordinates: [coords] },
            properties: {}
        }]
    };
}

function dist(a1: number, o1: number, a2: number, o2: number) {
    const R = 6371000, dA = (a2 - a1) * Math.PI / 180, dO = (o2 - o1) * Math.PI / 180;
    const x = Math.sin(dA / 2) ** 2 + Math.cos(a1 * Math.PI / 180) * Math.cos(a2 * Math.PI / 180) * Math.sin(dO / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function smartZoom(r: number, lat: number) {
    if (!r || r <= 0 || isNaN(lat)) return 15;
    const mpp0 = 40075016.686 * Math.cos(lat * Math.PI / 180) / 256;
    return Math.min(Math.max(Math.log2(mpp0 / (r / 120)), 12), 17);
}

export default function OfficeMap({ lat, lng, radius, userLat, userLng }: OfficeMapProps) {
    const mapRef = useRef<MapRef>(null);
    const [pov, setPov] = useState<"top" | "tilt">("tilt");
    const [ready, setReady] = useState(false);

    // Ensure all props are numbers (MySQL DECIMAL types are returned as strings by default)
    const numLat = Number(lat);
    const numLng = Number(lng);
    const numRad = Number(radius);

    const olat = !isNaN(numLat) && numLat !== 0 ? numLat : -1.273985;
    const olng = !isNaN(numLng) && numLng !== 0 ? numLng : 116.858260;
    const rad  = !isNaN(numRad) && numRad > 0 ? numRad : 200;
    const zoom = smartZoom(rad, olat);

    const [view, setView] = useState({ longitude: olng, latitude: olat, zoom, pitch: 55, bearing: -15 });

    // Update view when office coords/radius change — only after map is ready
    useEffect(() => {
        if (!ready || !mapRef.current || isNaN(olng) || isNaN(olat)) return;
        mapRef.current.flyTo({ center: [olng, olat], zoom, pitch: pov === "tilt" ? 55 : 0, bearing: pov === "tilt" ? -15 : 0, duration: 600 });
    }, [ready, olat, olng, rad]);

    // Pan toward user when GPS arrives — only after map is ready
    useEffect(() => {
        if (!ready || !mapRef.current || !userLat || !userLng || isNaN(userLat) || isNaN(userLng) || isNaN(olat) || isNaN(olng)) return;
        const midLat = (olat + userLat) / 2;
        const midLng = (olng + userLng) / 2;
        if (!isNaN(midLat) && !isNaN(midLng))
            mapRef.current.flyTo({ center: [midLng, midLat], zoom: zoom - 0.4, pitch: pov === "tilt" ? 55 : 0, bearing: pov === "tilt" ? -15 : 0, duration: 1000 });
    }, [ready, userLat, userLng]);

    const circleData = useMemo(() => makeCircle(olng, olat, rad), [olng, olat, rad]);

    const meters = (userLat && userLng && !isNaN(userLat) && !isNaN(userLng))
        ? dist(userLat, userLng, olat, olng) : null;
    const inside = meters !== null && meters <= rad;

    const togglePov = () => {
        const next = pov === "top" ? "tilt" : "top";
        setPov(next);
        mapRef.current?.flyTo({ center: [olng, olat], zoom, pitch: next === "tilt" ? 55 : 0, bearing: next === "tilt" ? -15 : 0, duration: 800 });
    };

    return (
        <div className="h-full w-full relative rounded-xl overflow-hidden">
            <ReactMapGL
                ref={mapRef}
                {...view}
                onLoad={() => setReady(true)}
                onMove={e => setView(e.viewState as any)}
                mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                style={{ width: "100%", height: "100%" }}
                maxPitch={70}
                attributionControl={false}
            >
                {/* ── Radius circle ── */}
                {ready && (
                    <Source id="office-radius" type="geojson" data={circleData}>
                        <Layer
                            id="radius-fill"
                            type="fill"
                            paint={{ "fill-color": "#3b82f6", "fill-opacity": 0.18 }}
                        />
                        <Layer
                            id="radius-outline"
                            type="line"
                            paint={{ "line-color": "#3b82f6", "line-width": 2.5, "line-dasharray": [4, 3] }}
                        />
                    </Source>
                )}

                {/* ── Office marker ── */}
                <Marker longitude={olng} latitude={olat} anchor="bottom">
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
                            <MapPin className="size-4" />
                        </div>
                        <div className="bg-white px-3 py-1 rounded-md text-[11px] font-bold shadow-lg text-blue-700 mt-1 uppercase tracking-wider whitespace-nowrap border border-blue-100">
                            LOKASI KANTOR
                        </div>
                    </div>
                </Marker>

                {/* ── User marker ── */}
                {userLat && userLng && !isNaN(userLat) && !isNaN(userLng) && (
                    <Marker longitude={userLng} latitude={userLat} anchor="center">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute rounded-full animate-ping opacity-60 size-10 bg-emerald-500" />
                            <div className={`relative z-10 text-white p-2 rounded-full shadow-xl border-2 border-white ${inside ? "bg-emerald-500" : "bg-rose-500"}`}>
                                <User className="size-4" />
                            </div>
                        </div>
                    </Marker>
                )}

                <div className="absolute right-2 top-2">
                    <NavigationControl showCompass={false} showZoom visualizePitch />
                </div>
            </ReactMapGL>

            {/* POV toggle */}
            <button onClick={togglePov}
                className="absolute bottom-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-white shadow-md">
                {pov === "top"
                    ? <><Layers className="size-3.5 text-blue-500" />3D</>
                    : <><Eye className="size-3.5 text-purple-500" />Atas</>}
            </button>

            {/* Distance badge */}
            {meters !== null && (
                <div className={`absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg
                    ${inside ? "bg-emerald-600/90 text-white border border-emerald-400" : "bg-rose-600/90 text-white border border-rose-400"}`}>
                    <span className={`size-1.5 rounded-full animate-pulse ${inside ? "bg-emerald-300" : "bg-rose-300"}`} />
                    {inside ? `✓ ${Math.round(meters)}m dari kantor` : `✗ ${Math.round(meters)}m dari kantor`}
                </div>
            )}
        </div>
    );
}
