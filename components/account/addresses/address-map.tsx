'use client';

import React, { useCallback, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface AddressMapProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1.5rem',
};

const AddressMap: React.FC<AddressMapProps> = ({ lat, lng, onLocationChange }) => {
    const mapRef = useRef<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            onLocationChange(e.latLng.lat(), e.latLng.lng());
        }
    };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat, lng }}
            zoom={16}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                styles: [
                    {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [
                            { "visibility": "off" }
                        ]
                    }
                ]
            }}
        >
            <Marker
                position={{ lat, lng }}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
                animation={google.maps.Animation.DROP}
            />
        </GoogleMap>
    );
};

export default React.memo(AddressMap);
