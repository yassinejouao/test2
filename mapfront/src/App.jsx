// import React, { useState, useEffect, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { RecenterAutomatically } from "../components/RecenterAutomatically/RecenterAutomatically";

// const App = () => {
//   const [position, setPosition] = useState([37.7749, -122.4194]);
//   const [map, setMap] = useState(null);

//   useEffect(() => {
//     const ws = new WebSocket("ws://localhost:8080");
//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setPosition([data.latitude, data.longitude]);
//       console.log("PASS");
//     };
//     return () => {
//       ws.close();
//     };
//   }, []);

//   useEffect(() => {
//     if (map) {
//       map.setView(position, 4);
//     }
//   }, [position, map]);

//   return (
//     <div>
//       <h1>Real-Time Map</h1>
//       <MapContainer
//         center={position}
//         zoom={13}
//         style={{ height: "500px", width: "100%" }}
//         ref={setMap}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />

//         <Marker position={position}>
//           <Popup>Current Position: {position.join(", ")}</Popup>
//         </Marker>
//       </MapContainer>
//     </div>
//   );
// };

// export default App;

/////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useState, useEffect, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// const App = () => {
//   const [position, setPosition] = useState([37.7749, -122.4194]);
//   const [map, setMap] = useState(null);
//   const [followMarker, setFollowMarker] = useState(true); // State to control whether to follow the marker

//   // Function to fetch position from API
//   const fetchPosition = async () => {
//     try {
//       const response = await fetch("http://localhost:3001/api/position");
//       if (response.ok) {
//         const data = await response.json();
//         setPosition([data.latitude, data.longitude]);
//       } else {
//         console.error("Error fetching position:", response.status);
//       }
//     } catch (err) {
//       console.error("Error fetching position:", err);
//     }
//   };

//   useEffect(() => {
//     // Fetch position every 2 seconds
//     const interval = setInterval(fetchPosition, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     if (map && followMarker) {
//       map.setView(position, 9);
//     }
//   }, [position, map, followMarker]);

//   // Toggle follow marker
//   const toggleFollowMarker = () => {
//     setFollowMarker((prev) => !prev);
//   };

//   return (
//     <div>
//       <h1>Real-Time Map</h1>
//       <button onClick={toggleFollowMarker}>
//         {followMarker ? "Stop Following" : "Start Following"}
//       </button>
//       <MapContainer
//         center={position}
//         zoom={13}
//         style={{ height: "500px", width: "100%" }}
//         ref={setMap}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         <Marker position={position}>
//           <Popup>Current Position: {position.join(", ")}</Popup>
//         </Marker>
//       </MapContainer>
//     </div>
//   );
// };

// export default App;
import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
} from "react-leaflet";
import {} from "leaflet"; // Corrected import from leaflet
import { EditControl } from "react-leaflet-draw"; // Correct import for EditControl
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const App = () => {
  const [position, setPosition] = useState([37.7749, -122.4194]);
  const [map, setMap] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [followMarker, setFollowMarker] = useState(true); // State to control whether to follow the marker

  // Function to fetch position from the backend API
  const fetchPosition = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/position");
      if (response.ok) {
        const data = await response.json();
        setPosition([data.latitude, data.longitude]);
      } else {
        console.error("Error fetching position:", response.status);
      }
    } catch (err) {
      console.error("Error fetching position:", err);
    }
  };

  // Function to save the drawn polygon to the backend
  const savePolygon = async (coordinates) => {
    try {
      const response = await fetch("http://localhost:3001/api/polygon/sf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points: coordinates, name: "My Polygon" }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Polygon saved:", data);
      } else {
        console.error("Error saving polygon:", response.status);
      }
    } catch (err) {
      console.error("Error saving polygon:", err);
    }
  };

  // Function to toggle drawing mode
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
  };

  // Toggle follow marker
  const toggleFollowMarker = () => {
    setFollowMarker((prev) => !prev);
  };

  // Fetch position every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchPosition, 2000);
    return () => clearInterval(interval);
  }, []);

  // Only update the map view if followMarker is true
  useEffect(() => {
    if (map && followMarker) {
      map.setView(position, 13); // Adjust zoom level as needed
    }
  }, [position, followMarker, map]); // Follow marker if state is true

  const onCreated = (event) => {
    const { layer } = event;
    const coordinates = layer
      .getLatLngs()[0]
      .map((latlng) => [latlng.lat, latlng.lng]);
    savePolygon(coordinates);
  };

  return (
    <div>
      <h1>Real-Time Map with Polygon Drawing</h1>
      <button onClick={toggleDrawingMode}>
        {drawingMode ? "Disable Drawing" : "Enable Drawing"}
      </button>
      <button onClick={toggleFollowMarker}>
        {followMarker ? "Stop Following" : "Start Following"}
      </button>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
        ref={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>Current Position: {position.join(", ")}</Popup>
        </Marker>

        <FeatureGroup>
          {drawingMode && (
            <EditControl
              position="topright"
              onCreated={onCreated}
              draw={{
                rectangle: true,
                circle: true,
                marker: true,
                polyline: true,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                  showLength: true, // Optionally enable length display if needed
                },
              }}
              edit={{
                remove: true, // Allow removing shapes
              }}
            />
          )}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default App;
