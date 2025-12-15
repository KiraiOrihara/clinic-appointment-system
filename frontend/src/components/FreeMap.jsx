import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

const FreeMap = ({ clinics, selectedClinic, onClinicSelect, center, zoom, useMapDataEndpoint = false }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const dorsuMarkerRef = useRef(null)
  const itBuildingMarkerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [mapError, setMapError] = useState(false)
  const [mapClinics, setMapClinics] = useState(clinics || [])

  // Free Google Maps API key (no credit card required for basic usage)
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  // Fetch map data from API if useMapDataEndpoint is true
  useEffect(() => {
    if (useMapDataEndpoint && !clinics?.length) {
      const fetchMapData = async () => {
        try {
          const rawBase = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';
          const baseUrl = rawBase.replace(/\/+$/, '').replace(/\/api$/, '');
          const response = await fetch(`${baseUrl}/api/clinics/map-data`);
          if (!response.ok) throw new Error('Failed to fetch map data')
          const data = await response.json()
          setMapClinics(data.map(clinic => ({
            ...clinic,
            latitude: clinic.latitude,
            longitude: clinic.longitude
          })))
        } catch (error) {
          console.error('Error fetching map data:', error)
          setMapError(true)
        }
      }
      fetchMapData()
    } else if (clinics?.length) {
      setMapClinics(clinics)
    }
  }, [useMapDataEndpoint, clinics])

  useEffect(() => {
    if (!mapRef.current) return

    // If no Google Maps API key, use Leaflet directly
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
      loadLeafletMap()
      return
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    })

    loader.load().then(() => {
      if (!mapInstanceRef.current) {
        // Initialize map
        const map = new window.google.maps.Map(mapRef.current, {
          center: center || { lat: 6.9397, lng: 126.2269 }, // Default to Mati City
          zoom: zoom || 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        mapInstanceRef.current = map
        setMapLoaded(true)

        // Add click handler to get coordinates
        map.addListener('click', (e) => {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          console.log('Map clicked at:', lat, lng)
        })
      }
    }).catch(error => {
      console.error('Error loading Google Maps:', error)
      setMapError(true)
      // Fallback to Leaflet if Google Maps fails
      loadLeafletMap()
    })
  }, [center, zoom, GOOGLE_MAPS_API_KEY])

  // Recenter map when center prop changes after initial load
  useEffect(() => {
    if (!mapInstanceRef.current || !center) return
    if (mapInstanceRef.current.setCenter) {
      mapInstanceRef.current.setCenter(center)
    } else if (mapInstanceRef.current.setView) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom || mapInstanceRef.current.getZoom?.() || 12)
    }
  }, [center, zoom])

  // Fallback to Leaflet (completely free, no API key needed)
  const loadLeafletMap = () => {
    // Load Leaflet CSS and JS
    const leafletCSS = document.createElement('link')
    leafletCSS.rel = 'stylesheet'
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(leafletCSS)

    const leafletJS = document.createElement('script')
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    leafletJS.onload = () => {
      if (!mapInstanceRef.current) {
        const map = window.L.map(mapRef.current).setView(
          [center?.lat || 6.9397, center?.lng || 126.2269], // Default to Mati City
          zoom || 12
        )

        // Add OpenStreetMap tiles (completely free)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        mapInstanceRef.current = map
        setMapLoaded(true)
      }
    }
    leafletJS.onerror = () => {
      console.error('Failed to load Leaflet')
      setMapError(true)
    }
    document.head.appendChild(leafletJS)
  }

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          
          // Center map on user location
          if (mapInstanceRef.current) {
            if (mapInstanceRef.current.setCenter) {
              // Google Maps
              mapInstanceRef.current.setCenter(location)
            } else {
              // Leaflet
              mapInstanceRef.current.setView([location.lat, location.lng], 13)
            }
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.code, error.message)
          // Set default location to DOrSU if geolocation fails
          const dorsuLocation = { lat: 6.9322763, lng: 126.2536529 }
          setUserLocation(dorsuLocation)
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        }
      )
    }
  }, [mapLoaded])

  // Add IT Building marker
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    // Remove existing IT Building marker if it exists
    if (itBuildingMarkerRef.current) {
      if (itBuildingMarkerRef.current.remove) {
        itBuildingMarkerRef.current.remove() // Google Maps
      } else if (itBuildingMarkerRef.current.removeFrom) {
        itBuildingMarkerRef.current.removeFrom(mapInstanceRef.current) // Leaflet
      }
    }

    const itCoords = { lat: 6.9325, lng: 126.2538 }

    if (window.google && window.google.maps) {
      // Google Maps IT Building marker
      const itMarker = new window.google.maps.Marker({
        position: itCoords,
        map: mapInstanceRef.current,
        title: 'Information Technology Building - DOrSU',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      })

      const itInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">Information Technology Building</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Davao Oriental State University</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Martinez Drive, Brgy. Dahican, Mati City</p>
            <p style="margin: 4px 0; font-size: 11px; color: #999;">Coordinates: 6.9325°N, 126.2538°E</p>
          </div>
        `
      })

      itMarker.addListener('click', () => {
        itInfoWindow.open(mapInstanceRef.current, itMarker)
      })

      itBuildingMarkerRef.current = itMarker
    } else if (window.L) {
      // Leaflet IT Building marker
      const itIcon = window.L.divIcon({
        html: `<div style="background: #F97316; color: white; padding: 8px; border-radius: 50%; font-weight: bold; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;">IT</div>`,
        iconSize: [30, 30],
        className: 'it-building-marker'
      })

      const itMarker = window.L.marker(
        [itCoords.lat, itCoords.lng],
        { icon: itIcon }
      ).addTo(mapInstanceRef.current)

      const itPopupContent = `
        <div style="padding: 8px; min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">Information Technology Building</h3>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">Davao Oriental State University</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">Martinez Drive, Brgy. Dahican, Mati City</p>
          <p style="margin: 4px 0; font-size: 11px; color: #999;">Coordinates: 6.9325°N, 126.2538°E</p>
        </div>
      `
      itMarker.bindPopup(itPopupContent)
      itBuildingMarkerRef.current = itMarker
    }
  }, [mapLoaded])

  // Add markers for clinics
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !mapClinics?.length) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.remove) {
        marker.remove() // Google Maps
      } else if (marker.removeFrom) {
        marker.removeFrom(mapInstanceRef.current) // Leaflet
      }
    })
    markersRef.current = []

    // Add new markers with popups
    mapClinics.forEach(clinic => {
      if (!clinic.latitude || !clinic.longitude) return
      
      if (window.google && window.google.maps) {
        // Google Maps marker with info window
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(clinic.latitude), lng: parseFloat(clinic.longitude) },
          map: mapInstanceRef.current,
          title: clinic.name,
          icon: {
            url: clinic.is_active ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          },
          label: {
            text: clinic.name.charAt(0),
            color: 'white',
            fontWeight: 'bold'
          }
        })

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${clinic.name}</h3>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.address || ''}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.phone || ''}</p>
              <p style="margin: 4px 0;">
                <span style="padding: 2px 8px; background: ${clinic.is_active ? '#10B981' : '#EF4444'}; color: white; border-radius: 12px; font-size: 11px;">
                  ${clinic.is_active ? 'Open' : 'Closed'}
                </span>
              </p>
              ${clinic.services?.length > 0 ? `<p style="margin: 4px 0; font-size: 11px; color: #666;">Services: ${clinic.services.join(', ')}</p>` : ''}
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker)
          if (onClinicSelect) {
            onClinicSelect(clinic)
          }
        })

        markersRef.current.push(marker)
      } else if (window.L) {
        // Leaflet marker with popup
        const icon = window.L.divIcon({
          html: `<div style="background: ${clinic.is_active ? '#10B981' : '#EF4444'}; color: white; padding: 8px; border-radius: 50%; font-weight: bold; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${clinic.name.charAt(0)}</div>`,
          iconSize: [30, 30],
          className: 'custom-marker'
        })

        const marker = window.L.marker(
          [parseFloat(clinic.latitude), parseFloat(clinic.longitude)],
          { icon }
        ).addTo(mapInstanceRef.current)

        // Create popup
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${clinic.name}</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.address || ''}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.phone || ''}</p>
            <p style="margin: 4px 0;">
              <span style="padding: 2px 8px; background: ${clinic.is_active ? '#10B981' : '#EF4444'}; color: white; border-radius: 12px; font-size: 11px;">
                ${clinic.is_active ? 'Open' : 'Closed'}
              </span>
            </p>
            ${clinic.services?.length > 0 ? `<p style="margin: 4px 0; font-size: 11px; color: #666;">Services: ${clinic.services.join(', ')}</p>` : ''}
          </div>
        `
        marker.bindPopup(popupContent)

        marker.on('click', () => {
          if (onClinicSelect) {
            onClinicSelect(clinic)
          }
        })

        markersRef.current.push(marker)
      }
    })

    // Center map on selected clinic
    if (selectedClinic && mapInstanceRef.current) {
      if (mapInstanceRef.current.setCenter) {
        // Google Maps
        mapInstanceRef.current.setCenter({
          lat: parseFloat(selectedClinic.latitude),
          lng: parseFloat(selectedClinic.longitude)
        })
        mapInstanceRef.current.setZoom(15)
      } else {
        // Leaflet
        mapInstanceRef.current.setView([
          parseFloat(selectedClinic.latitude),
          parseFloat(selectedClinic.longitude)
        ], 15)
      }
    }
  }, [mapClinics, mapLoaded, onClinicSelect, selectedClinic])

  // Add user location marker
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !userLocation) return

    if (window.google && window.google.maps) {
      // Google Maps user location marker
      const marker = new window.google.maps.Marker({
        position: userLocation,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      })
      markersRef.current.push(marker)
    } else if (window.L) {
      // Leaflet user location marker
      const icon = window.L.divIcon({
        html: '<div style="background: #4285F4; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>',
        iconSize: [16, 16],
        className: 'user-location-marker'
      })

      const marker = window.L.marker([userLocation.lat, userLocation.lng], { icon })
        .addTo(mapInstanceRef.current)
      markersRef.current.push(marker)
    }
  }, [userLocation, mapLoaded])

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
      
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-red-600 mb-2">Unable to load map</p>
            <p className="text-gray-600 text-sm">Please check your internet connection</p>
          </div>
        </div>
      )}

      {!GOOGLE_MAPS_API_KEY && mapLoaded && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-md z-10">
          <p className="text-xs text-gray-600">Using OpenStreetMap (Free)</p>
        </div>
      )}
    </div>
  )
}

export default FreeMap
