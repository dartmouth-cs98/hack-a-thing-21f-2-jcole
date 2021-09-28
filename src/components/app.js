import React, { useState } from 'react';
import { formatRelative } from 'date-fns';
import '../style.scss';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,

} from '@reach/combobox';
import '@reach/combobox/styles.css';
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
  const [selected, setSelected] = useState(null);

  const onMapClick = React.useCallback((event) => {
    setMarkers((current) => [...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      }]);
  }, []);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  if (loadError) {
    console.log('Shit');
    return 'Error Loading Maps';
  }
  if (!isLoaded) return 'Loading Maps';

  return (
    <div>
      <h1>Bears</h1>
      <Search panTo={panTo} />
      <Locate panTo={panTo} />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {selected ? (
          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>
                Bear Spotted
              </h2>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  return (
    <button
      className="locate"
      type="button"
      onClick={() => {
        navigator.geolocation.getCurrentPosition((position) => {
          panTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => null);
      }}
    >
      <img src="src\img\iconmonstr-location-25.svg"
        alt="compass - locate me"
      />
    </button>
  );
}

function Search({ panTo }) {
  const {
    ready, value, suggestions: { status, data }, setValue, clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: {
        lat: () => 43.7022928,
        lng: () => -72.2895353,
      },
      radius: 200 * 1000,
    },
  });

  return (
    <div className="search">
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();
          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            console.log(lat);
            panTo({ lat, lng });
          } catch (error) {
            console.log('Error!');
          }
        }}
      >
        <ComboboxInput value={value}
          onChange={(event) => { setValue(event.target.value); }}
          disabled={!ready}
          placeholder="Enter and Address"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === 'OK' && data.map(({ id, description }) => (
              <ComboboxOption
                key={id}
                value={description}
              />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
