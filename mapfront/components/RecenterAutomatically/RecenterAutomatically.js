import React from "react";
import { useMap } from "react-leaflet";

export const RecenterAutomatically = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([position[0], position[1]]);
  }, [position[0], position[1]]);
  return null;
};
