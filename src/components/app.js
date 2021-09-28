import React, { useState } from 'react';
import '../style.scss';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  // InfoWindow,
} from '@react-google-maps/api';
import mapStyles from '../mapStyles';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};
const center = {
  lat: 43.7022928,
  lng: -72.2895353,
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
};

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAROOtKuWTXgdLdnXf82jU-XQY2HCz2-IQ',
    libraries,
  });

  const [markers, setMarkers] = useState([]);

  const onMapClick = React.useCallback((event) => {
    setMarkers((current) => [...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      }]);
  }, []);

  // const mapRef = React.useRef();

  if (loadError) {
    console.log('Shit');
    return 'Error Loading Maps';
  }
  if (!isLoaded) return 'Loading Maps';

  return (
    <div>
      <h1>Bears</h1>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={center}
        options={options}
        onClick={onMapClick}
      >
        {markers.map((marker) => (
          <Marker key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
