// hooks/useGeo.js
import { useState, useCallback } from 'react';

export const useGeo = () => {
  const [state, setState] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    error: null,
    loading: false,
  });

  const fetchAddress = useCallback(async (latitude, longitude) => {
    try {
      // Add cache busting to avoid stale results
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&t=${Date.now()}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en', // Get addresses in English
          'User-Agent': 'AttendanceApp/1.0' // Required by Nominatim - change to your app name
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch address');
      
      const data = await response.json();
      console.log("full address....", data)
      
      // Format the address in a structured way
      return {
        full: data.display_name,
        short: data.address?.road 
          ? `${data.address.road}${data.address.house_number ? ' ' + data.address.house_number : ''}`
          : data.display_name?.split(',')[0] || 'Unknown location',
        road: data.address?.road || '',
        houseNumber: data.address?.house_number || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        state: data.address?.state || '',
        country: data.address?.country || '',
        postcode: data.address?.postcode || '',
        suburb: data.address?.suburb || '',
        neighbourhood: data.address?.neighbourhood || ''
      };
    } catch (error) {
      console.error('Address fetch error:', error);
      return null;
    }
  }, []);

  const fetchLocation = useCallback(async (includeAddress = true) => {
    if (!navigator.geolocation) {
      setState(s => ({
        ...s,
        error: "Geolocation not supported by this browser",
        loading: false
      }));
      return Promise.reject(new Error("Not supported"));
    }

    setState(s => ({ ...s, loading: true, error: null }));

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
            console.log("current position..........", pos)
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };

          let address = null;
          if (includeAddress) {
            address = await fetchAddress(coords.latitude, coords.longitude);
          }

          const newState = {
            ...coords,
            address,
            loading: false,
            error: null
          };
          
          setState(newState);
          resolve(newState);
        },
        (err) => {
          const msg = err.code === 1
            ? "Location permission denied. Please allow access in browser settings."
            : err.code === 2
              ? "Location unavailable. Please try again."
              : "Location request timed out. Please try again.";
          
          setState(s => ({ ...s, loading: false, error: msg }));
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0, // Always get fresh location
        }
      );
    });
  }, [fetchAddress]);

  // Method to manually retry fetching address for current coordinates
  const refreshAddress = useCallback(async () => {
    if (!state.latitude || !state.longitude) {
      return null;
    }
    
    setState(s => ({ ...s, loading: true }));
    
    try {
      const address = await fetchAddress(state.latitude, state.longitude);
      setState(s => ({ ...s, address, loading: false }));
      return address;
    } catch (error) {
      setState(s => ({ ...s, loading: false, error: error.message }));
      return null;
    }
  }, [state.latitude, state.longitude, fetchAddress]);

  return { 
    ...state, 
    fetchLocation,
    refreshAddress 
  };
};