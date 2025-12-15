import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { clinicService } from '../services/api'
// Mapbox controls are added directly, not imported

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

const MapboxClinicMap = ({ 
  onClinicSelect, 
  selectedClinic,
  filters = {},
  showUserLocation = true,
  enableClustering = true,
  mapStyle = 'mapbox://styles/mapbox/streets-v12'
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const popupsRef = useRef([])
  const userMarkerRef = useRef(null)
  const accuracyCircleRef = useRef(null)
  const routeLayerRef = useRef(null)
  const radiusCircleRef = useRef(null)
  const clusterLayerRef = useRef(null)
  
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [userAccuracy, setUserAccuracy] = useState(null)
  const [clinics, setClinics] = useState([])
  const [filteredClinics, setFilteredClinics] = useState([])
  const [nearestClinic, setNearestClinic] = useState(null)
  const [distanceFilter, setDistanceFilter] = useState(null) // in km
  const [mapStyleState, setMapStyleState] = useState(mapStyle)
  const [favoriteClinics, setFavoriteClinics] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [locationPermission, setLocationPermission] = useState('prompt')

  // Calculate distance using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is required')
      return
    }

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyleState,
      center: [126.2167, 6.9551], // Default to Mati City
      zoom: 12,
      attributionControl: false
    })

    // Add controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    mapInstance.addControl(new mapboxgl.ScaleControl(), 'bottom-left')
    
    if (showUserLocation) {
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      })
      mapInstance.addControl(geolocate, 'top-right')
      
      geolocate.on('geolocate', (e) => {
        const { coords } = e
        setUserLocation([coords.longitude, coords.latitude])
        setUserAccuracy(coords.accuracy)
      })
    }

    mapInstance.on('load', () => {
      setMapLoaded(true)
    })

    map.current = mapInstance

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapStyleState, showUserLocation])

  // Fetch clinic data from API
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await clinicService.getMapData()
        setClinics(data)
        setFilteredClinics(data)
      } catch (error) {
        console.error('Error fetching clinics:', error)
      }
    }
    fetchClinics()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...clinics]

    // Service filter
    if (filters.services && filters.services.length > 0) {
      filtered = filtered.filter(clinic => 
        clinic.services?.some(service => filters.services.includes(service))
      )
    }

    // Availability filter
    if (filters.availability === 'open') {
      filtered = filtered.filter(clinic => clinic.is_active)
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(clinic => 
        (clinic.average_rating || 0) >= filters.minRating
      )
    }

    // Insurance filter
    if (filters.insurance) {
      filtered = filtered.filter(clinic => 
        clinic.accepted_insurance?.includes(filters.insurance)
      )
    }

    // Distance filter
    if (distanceFilter && userLocation) {
      filtered = filtered.filter(clinic => {
        const distance = calculateDistance(
          userLocation[1], userLocation[0],
          clinic.latitude, clinic.longitude
        )
        return distance <= distanceFilter
      })
    }

    // Calculate distances and sort by proximity
    if (userLocation) {
      filtered = filtered.map(clinic => ({
        ...clinic,
        distance: calculateDistance(
          userLocation[1], userLocation[0],
          clinic.latitude, clinic.longitude
        )
      })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
    }

    setFilteredClinics(filtered)
    
    // Set nearest clinic
    if (filtered.length > 0 && userLocation) {
      setNearestClinic(filtered[0])
    }
  }, [clinics, filters, distanceFilter, userLocation, calculateDistance])

  // Add user location marker and accuracy circle
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove()
    }

    // Add blue dot marker for user location
    const el = document.createElement('div')
    el.className = 'user-location-marker'
    el.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: #4285F4;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `
    
    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat(userLocation)
      .addTo(map.current)

    // Add accuracy circle
    if (userAccuracy) {
      const radius = userAccuracy / 1000 // Convert meters to km
      const circle = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: userLocation
        },
        properties: {
          radius: radius
        }
      }

      if (!map.current.getSource('user-accuracy')) {
        map.current.addSource('user-accuracy', {
          type: 'geojson',
          data: circle
        })

        map.current.addLayer({
          id: 'user-accuracy-circle',
          type: 'circle',
          source: 'user-accuracy',
          paint: {
            'circle-radius': {
              stops: [[0, 0], [20, radius * 1000]],
              base: 2
            },
            'circle-color': '#4285F4',
            'circle-opacity': 0.1,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#4285F4',
            'circle-stroke-opacity': 0.3
          }
        })
      } else {
        map.current.getSource('user-accuracy').setData(circle)
      }
      accuracyCircleRef.current = { remove: () => {
        if (map.current.getLayer('user-accuracy-circle')) {
          map.current.removeLayer('user-accuracy-circle')
        }
        if (map.current.getSource('user-accuracy')) {
          map.current.removeSource('user-accuracy')
        }
      }}
    }
  }, [userLocation, userAccuracy, mapLoaded])

  // Add clinic markers with clustering
  useEffect(() => {
    if (!map.current || !mapLoaded || filteredClinics.length === 0) return

    // Clear existing markers and popups
    markersRef.current.forEach(marker => marker.remove())
    popupsRef.current.forEach(popup => popup.remove())
    markersRef.current = []
    popupsRef.current = []

    if (enableClustering && filteredClinics.length > 10) {
      // Use clustering for many markers
      const geojson = {
        type: 'FeatureCollection',
        features: filteredClinics.map(clinic => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [clinic.longitude, clinic.latitude]
          },
          properties: {
            id: clinic.id,
            name: clinic.name,
            is_active: clinic.is_active,
            services: clinic.services || [],
            address: clinic.address,
            phone: clinic.phone,
            isNearest: nearestClinic?.id === clinic.id
          }
        }))
      }

      if (!map.current.getSource('clinics')) {
        map.current.addSource('clinics', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        })

        // Add cluster circles
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'clinics',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              10,
              '#f1f075',
              30,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              30,
              40
            ]
          }
        })

        // Add cluster count labels
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'clinics',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        })

        // Add individual clinic markers
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'clinics',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['get', 'isNearest'],
              '#10B981',
              ['get', 'is_active'],
              '#3B82F6',
              '#EF4444'
            ],
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        })

        // Pulse animation for nearest clinic
        if (nearestClinic) {
          const nearestFeature = geojson.features.find(f => f.properties.isNearest)
          if (nearestFeature) {
            const marker = new mapboxgl.Marker({
              color: '#10B981',
              scale: 1.2
            })
              .setLngLat(nearestFeature.geometry.coordinates)
              .addTo(map.current)
            
            // Add pulse animation
            const pulse = () => {
              marker.getElement().style.animation = 'pulse 2s infinite'
            }
            pulse()
            markersRef.current.push(marker)
          }
        }

        // Click handlers
        map.current.on('click', 'clusters', (e) => {
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          })
          const clusterId = features[0].properties.cluster_id
          map.current.getSource('clinics').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            })
          })
        })

        map.current.on('click', 'unclustered-point', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice()
          const properties = e.features[0].properties
          const clinic = filteredClinics.find(c => c.id === properties.id)
          
          if (clinic && onClinicSelect) {
            onClinicSelect(clinic)
          }
          
          showClinicPopup(coordinates, clinic || properties)
        })

        map.current.on('mouseenter', 'unclustered-point', () => {
          map.current.getCanvas().style.cursor = 'pointer'
        })

        map.current.on('mouseleave', 'unclustered-point', () => {
          map.current.getCanvas().style.cursor = ''
        })

        clusterLayerRef.current = {
          remove: () => {
            if (map.current.getLayer('clusters')) map.current.removeLayer('clusters')
            if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count')
            if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point')
            if (map.current.getSource('clinics')) map.current.removeSource('clinics')
          }
        }
      } else {
        map.current.getSource('clinics').setData(geojson)
      }
    } else {
      // Individual markers (no clustering)
      filteredClinics.forEach(clinic => {
        if (!clinic.latitude || !clinic.longitude) return

        const isNearest = nearestClinic?.id === clinic.id
        const isFavorite = favoriteClinics.includes(clinic.id)
        
        // Custom marker element
        const el = document.createElement('div')
        el.className = 'clinic-marker'
        el.style.cssText = `
          width: ${isNearest ? '32px' : '24px'};
          height: ${isNearest ? '32px' : '24px'};
          background-color: ${clinic.is_active ? '#10B981' : '#EF4444'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          ${isNearest ? 'animation: pulse 2s infinite;' : ''}
          ${isFavorite ? 'box-shadow: 0 0 0 3px #FBBF24;' : ''}
        `

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([clinic.longitude, clinic.latitude])
          .addTo(map.current)

        marker.getElement().addEventListener('click', () => {
          if (onClinicSelect) {
            onClinicSelect(clinic)
          }
          showClinicPopup([clinic.longitude, clinic.latitude], clinic)
        })

        marker.getElement().addEventListener('mouseenter', () => {
          marker.getElement().style.transform = 'scale(1.2)'
        })

        marker.getElement().addEventListener('mouseleave', () => {
          marker.getElement().style.transform = 'scale(1)'
        })

        markersRef.current.push(marker)
      })
    }

    // Center map on nearest clinic if found
    if (nearestClinic && userLocation) {
      map.current.flyTo({
        center: [nearestClinic.longitude, nearestClinic.latitude],
        zoom: 14,
        duration: 2000
      })
    }
  }, [filteredClinics, mapLoaded, nearestClinic, enableClustering, onClinicSelect, favoriteClinics])

  // Ensure map navigation and marker visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Adjust zoom and visibility settings
    map.current.on('zoomend', () => {
      const zoomLevel = map.current.getZoom();
      if (zoomLevel < 10) {
        if (map.current.getLayer('unclustered-point')) {
          map.current.setLayoutProperty('unclustered-point', 'visibility', 'none');
        }
      } else {
        if (map.current.getLayer('unclustered-point')) {
          map.current.setLayoutProperty('unclustered-point', 'visibility', 'visible');
        }
      }
    });

    // Ensure markers are visible at various zoom levels
    markersRef.current.forEach(marker => {
      marker.getElement().style.display = 'block';
    });

  }, [mapLoaded, markersRef])

  // Show clinic popup
  const showClinicPopup = (coordinates, clinic) => {
    // Remove existing popups
    popupsRef.current.forEach(popup => popup.remove())
    popupsRef.current = []

    const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML(`
        <div style="min-width: 250px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${clinic.name}</h3>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.address || ''}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.phone || ''}</p>
          <p style="margin: 4px 0;">
            <span style="padding: 2px 8px; background: ${clinic.is_active ? '#10B981' : '#EF4444'}; color: white; border-radius: 12px; font-size: 11px;">
              ${clinic.is_active ? 'Open' : 'Closed'}
            </span>
            ${clinic.distance ? `<span style="margin-left: 8px; font-size: 11px; color: #666;">${clinic.distance.toFixed(1)} km away</span>` : ''}
          </p>
          ${clinic.services?.length > 0 ? `<p style="margin: 4px 0; font-size: 11px; color: #666;">Services: ${clinic.services.slice(0, 3).join(', ')}${clinic.services.length > 3 ? '...' : ''}</p>` : ''}
          <div style="margin-top: 8px; display: flex; gap: 4px;">
            <button onclick="window.getDirections(${clinic.longitude}, ${clinic.latitude})" style="padding: 4px 8px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              Get Directions
            </button>
            <button onclick="window.bookAppointment(${clinic.id})" style="padding: 4px 8px; background: #10B981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              Book Now
            </button>
          </div>
        </div>
      `)
      .addTo(map.current)

    popupsRef.current.push(popup)

    // Add global functions for popup buttons
    window.getDirections = (lng, lat) => {
      if (userLocation) {
        showRoute(userLocation, [lng, lat])
      } else {
        alert('Please enable location services to get directions')
      }
    }

    window.bookAppointment = (clinicId) => {
      if (onClinicSelect) {
        const clinic = filteredClinics.find(c => c.id === clinicId)
        if (clinic) {
          onClinicSelect(clinic)
          // Navigate to booking page
          window.location.href = `/book/${clinicId}`
        }
      }
    }
  }

  // Show route to clinic
  const showRoute = (start, end) => {
    if (!map.current) return

    // Remove existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
    }

    // Use Mapbox Directions API
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 'Ok') {
          const route = data.routes[0].geometry

          if (!map.current.getSource('route')) {
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: route
              }
            })

            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3B82F6',
                'line-width': 4,
                'line-opacity': 0.75
              }
            })
          } else {
            map.current.getSource('route').setData({
              type: 'Feature',
              geometry: route
            })
          }

          routeLayerRef.current = {
            remove: () => {
              if (map.current.getLayer('route')) map.current.removeLayer('route')
              if (map.current.getSource('route')) map.current.removeSource('route')
            }
          }
        }
      })
      .catch(err => console.error('Error fetching route:', err))
  }

  // Add distance radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation || !distanceFilter) return

    const circle = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: userLocation
      },
      properties: {
        radius: distanceFilter
      }
    }

    if (!map.current.getSource('distance-radius')) {
      map.current.addSource('distance-radius', {
        type: 'geojson',
        data: circle
      })

      map.current.addLayer({
        id: 'distance-radius-circle',
        type: 'circle',
        source: 'distance-radius',
        paint: {
          'circle-radius': {
            stops: [[0, 0], [20, distanceFilter * 1000]],
            base: 2
          },
          'circle-color': '#FBBF24',
          'circle-opacity': 0.1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FBBF24',
          'circle-stroke-opacity': 0.5
        }
      })
    } else {
      map.current.getSource('distance-radius').setData(circle)
    }

    radiusCircleRef.current = {
      remove: () => {
        if (map.current.getLayer('distance-radius-circle')) {
          map.current.removeLayer('distance-radius-circle')
        }
        if (map.current.getSource('distance-radius')) {
          map.current.removeSource('distance-radius')
        }
      }
    }
  }, [userLocation, distanceFilter, mapLoaded])

  // Center on selected clinic
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedClinic) return

    map.current.flyTo({
      center: [selectedClinic.longitude, selectedClinic.latitude],
      zoom: 15,
      duration: 1000
    })
  }, [selectedClinic, mapLoaded])

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ width: '100%', height: '600px', minHeight: '600px' }}
      />
      
      {/* Map style toggle */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
        <select
          value={mapStyleState}
          onChange={(e) => setMapStyleState(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="mapbox://styles/mapbox/streets-v12">Streets</option>
          <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
          <option value="mapbox://styles/mapbox/light-v11">Light</option>
          <option value="mapbox://styles/mapbox/dark-v11">Dark</option>
        </select>
      </div>

      {/* Distance filter */}
      {userLocation && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <label className="block text-sm font-medium mb-2">Distance Filter</label>
          <select
            value={distanceFilter || ''}
            onChange={(e) => setDistanceFilter(e.target.value ? parseFloat(e.target.value) : null)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="">All distances</option>
            <option value="1">Within 1 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
          </select>
        </div>
      )}

      {/* Find Nearest Clinic Button */}
      {nearestClinic && userLocation && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <button
            onClick={() => {
              map.current.flyTo({
                center: [nearestClinic.longitude, nearestClinic.latitude],
                zoom: 15,
                duration: 2000
              })
              if (onClinicSelect) {
                onClinicSelect(nearestClinic)
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
          >
            Find Nearest Clinic ({nearestClinic.distance?.toFixed(1)} km)
          </button>
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .mapboxgl-popup-close-button {
          font-size: 20px;
          padding: 4px 8px;
        }
      `}</style>
    </div>
  )
}

export default MapboxClinicMap
