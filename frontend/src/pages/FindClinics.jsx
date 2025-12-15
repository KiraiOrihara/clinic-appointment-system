import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const FindClinics = () => {
  const [map, setMap] = useState(null)
  const [clinics, setClinics] = useState([])
  const [filteredClinics, setFilteredClinics] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [locationPermission, setLocationPermission] = useState('prompt')
  const [nearestClinic, setNearestClinic] = useState(null)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapMarkers, setMapMarkers] = useState([])
  const [userMarker, setUserMarker] = useState(null)
  const [showOnlyOpen, setShowOnlyOpen] = useState(false) // default show everything so reopened clinics are visible
  const [distanceFilter, setDistanceFilter] = useState(null) // Distance filter in km
  const [serviceFilter, setServiceFilter] = useState([]) // Service type filter
  const [ratingFilter, setRatingFilter] = useState(0) // Minimum rating filter
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12')
  const [favoriteClinics, setFavoriteClinics] = useState([])

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in kilometers
  }

  // Get user location with permission handling
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('unsupported')
      return Promise.reject(new Error('Geolocation unsupported'))
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          const coords = [longitude, latitude]
          setUserLocation(coords)
          setLocationPermission('granted')
          
          if (map) {
            map.flyTo({ center: coords, zoom: 13 })
            addUserMarker(coords, accuracy)
          }
          resolve(coords)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationPermission('denied')
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  // Add user marker to map
  const addUserMarker = (coordinates, accuracy) => {
    if (userMarker) {
      userMarker.remove()
    }

    // Add user location marker
    const marker = new mapboxgl.Marker({
      color: '#3B82F6',
      element: createUserLocationElement()
    })
      .setLngLat(coordinates)
      .addTo(map)

    setUserMarker(marker)

    // Add accuracy circle
    if (accuracy) {
      // Create accuracy circle (simplified version)
      const circleElement = document.createElement('div')
      circleElement.style.width = `${accuracy * 2}px`
      circleElement.style.height = `${accuracy * 2}px`
      circleElement.style.borderRadius = '50%'
      circleElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
      circleElement.style.border = '2px solid rgba(59, 130, 246, 0.3)'
      
      new mapboxgl.Marker({ element: circleElement })
        .setLngLat(coordinates)
        .addTo(map)
    }
  }

  // Create user location element
  const createUserLocationElement = () => {
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="
        width: 16px;
        height: 16px;
        background-color: #3B82F6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -8px;
          left: -8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(59, 130, 246, 0.3);
          animation: pulse 2s infinite;
        "></div>
      </div>
    `
    return element
  }

  // Enhance 'Nearest Clinic' feature
  const findNearestClinic = () => {
    if (!userLocation || clinics.length === 0) {
      alert('Please enable location access first by clicking "My Location" button');
      return;
    }

    // Calculate distances for all clinics (not just filtered)
    const clinicsWithDistance = clinics
      .filter(clinic => clinic.lat && clinic.lng) // Only clinics with valid coordinates
      .map(clinic => ({
        ...clinic,
        distance: calculateDistance(
          userLocation[1], userLocation[0],
          clinic.lat, clinic.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

    if (clinicsWithDistance.length === 0) {
      alert('No clinics with valid coordinates found');
      return;
    }

    // Update filtered clinics with sorted distances
    setFilteredClinics(clinicsWithDistance);

    // Highlight nearest clinic on map
    const nearest = clinicsWithDistance[0];
    setNearestClinic(nearest);
    
    if (map && nearest) {
      map.flyTo({ 
        center: [nearest.lng, nearest.lat], 
        zoom: 15,
        duration: 1500
      });
      
      // Show popup for nearest clinic
      setTimeout(() => {
        const marker = mapMarkers.find(m => {
          const markerLngLat = m.getLngLat();
          return Math.abs(markerLngLat.lng - nearest.lng) < 0.0001 && 
                 Math.abs(markerLngLat.lat - nearest.lat) < 0.0001;
        });
        if (marker && marker.getPopup()) {
          marker.togglePopup();
        }
      }, 1600);
    }
  };

  // Initialize map with comprehensive Mapbox features
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is required')
      return
    }

    // Ensure the map container exists and has proper dimensions
    const mapContainer = document.getElementById('map')
    if (!mapContainer) {
      console.error('Map container not found')
      return
    }

    // Force container to have dimensions before map initialization
    mapContainer.style.width = '100%'
    mapContainer.style.height = '100%'

    const DORSU_COORDINATES = [126.2512, 6.9383]; // Example coordinates for DORSU School

    const mapInstance = new mapboxgl.Map({
      container: 'map',
      style: mapStyle,
      center: DORSU_COORDINATES, // Center on DORSU School
      zoom: 15,
      attributionControl: false,
      preserveDrawingBuffer: true,
      fadeDuration: 0,
      bearingSnap: 7
    })

    // Add map controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapInstance.addControl(new mapboxgl.FullscreenControl(), 'top-right')
    mapInstance.addControl(new mapboxgl.ScaleControl(), 'bottom-left')
    
    // Add geolocate control
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
      mapInstance.flyTo({ 
        center: [coords.longitude, coords.latitude], 
        zoom: 13 
      })
    })

    mapInstance.on('load', () => {
      setMap(mapInstance)
      // Force multiple resizes to ensure map fills container properly
      mapInstance.resize()
      setTimeout(() => mapInstance.resize(), 50)
      setTimeout(() => mapInstance.resize(), 100)
      setTimeout(() => mapInstance.resize(), 200)
      // Try to get user location on load
      getUserLocation()
    })

    // Update map style when changed
    const handleStyleChange = () => {
      if (mapInstance && mapStyle) {
        mapInstance.setStyle(mapStyle)
        mapInstance.once('style.load', () => {
          // Re-add markers after style loads
          if (filteredClinics.length > 0) {
            // Markers will be re-added by the useEffect that watches filteredClinics
          }
        })
      }
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, []) // Only run once on mount

  // Update map style separately
  useEffect(() => {
    if (map && mapStyle) {
      map.setStyle(mapStyle)
    }
  }, [mapStyle, map])

  // Load clinics from API
  const fetchClinics = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/clinics')
      if (!response.ok) throw new Error('Failed to fetch clinics')
      const data = await response.json()

      const transformedClinics = data.map(clinic => {
        // Use actual coordinates from database, fallback to Mati City center if missing
        const lat = parseFloat(clinic.latitude);
        const lng = parseFloat(clinic.longitude);
        
        // Validate coordinates are within reasonable range for Philippines
        const validLat = (lat && lat >= 5 && lat <= 20) ? lat : 6.9569;
        const validLng = (lng && lng >= 120 && lng <= 130) ? lng : 126.2167;
        
        // Normalize status: 'open' or 'active' = open, everything else = closed
        const normalizedStatus = (clinic.status === 'open' || clinic.status === 'active') ? 'open' : 'closed';
        
        return {
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          lat: validLat,
          lng: validLng,
          services: clinic.services || [],
          rating: parseFloat(clinic.average_rating) || 0,
          status: normalizedStatus,
          phone: clinic.phone,
          email: clinic.email,
          doctor_count: clinic.doctor_count || 0,
          doctors: clinic.doctors || []
        };
      })

      setClinics(transformedClinics)
      setFilteredClinics(transformedClinics)
    } catch (error) {
      console.error('Error fetching clinics:', error)
      setClinics([])
      setFilteredClinics([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClinics()
  }, [])

  // Load map data from dedicated endpoint to update coordinates and status
  useEffect(() => {
    if (clinics.length === 0) return // Wait for clinics to load first
    
    const fetchMapData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/clinics/map-data')
        if (!response.ok) throw new Error('Failed to fetch map data')
        const mapData = await response.json()
        
        if (mapData && mapData.length > 0) {
          setClinics(prev => {
            const merged = prev.map(c => {
              const mapClinic = mapData.find(mc => mc.id === c.id)
              if (mapClinic) {
                // Use coordinates from map-data if available and valid
                const lat = parseFloat(mapClinic.latitude)
                const lng = parseFloat(mapClinic.longitude)
                if (lat && lng && !isNaN(lat) && !isNaN(lng) &&
                    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  // Normalize status
                  const normalizedStatus = (mapClinic.status === 'open' || mapClinic.status === 'active') ? 'open' : 'closed';
                  return { 
                    ...c, 
                    lat: lat, 
                    lng: lng,
                    status: normalizedStatus // Update status from map-data
                  }
                }
              }
              return c
            })
            return merged
          })
        }
      } catch (error) {
        console.error('Error fetching map data:', error)
      }
    }
    
    fetchMapData()
  }, [clinics.length])

  // Refresh clinics whenever the user focuses the tab to keep reopened clinics visible
  useEffect(() => {
    const onFocus = () => fetchClinics()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  // Handle window resize to ensure map fills container
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        // Multiple resizes to ensure proper filling
        map.resize()
        setTimeout(() => map.resize(), 50)
        setTimeout(() => map.resize(), 100)
      }
    }

    // Add resize observer for more responsive resizing
    let resizeObserver
    if (window.ResizeObserver && map) {
      const mapContainer = document.getElementById('map')
      resizeObserver = new ResizeObserver(() => {
        if (map) {
          map.resize()
        }
      })
      resizeObserver.observe(mapContainer)
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [map])

  // Filter clinics based on all filters
  useEffect(() => {
    let filtered = [...clinics]

    // Status filter
    if (showOnlyOpen) {
      filtered = filtered.filter(c => {
        const status = c.status?.toLowerCase();
        return status === 'open' || status === 'active';
      });
    }

    // Service filter
    if (serviceFilter.length > 0) {
      filtered = filtered.filter(c => 
        c.services?.some(service => serviceFilter.includes(service))
      )
    }

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(c => 
        (c.rating || 0) >= ratingFilter
      )
    }

    // Distance filter
    if (distanceFilter && userLocation) {
      filtered = filtered.filter(c => {
        if (!c.lat || !c.lng) return false
        const distance = calculateDistance(
          userLocation[1], userLocation[0],
          c.lat, c.lng
        )
        return distance <= distanceFilter
      })
    }

    // Calculate distances and sort by proximity if user location available
    if (userLocation) {
      filtered = filtered
        .filter(clinic => clinic.lat && clinic.lng) // Only clinics with valid coordinates
        .map(clinic => ({
          ...clinic,
          distance: calculateDistance(
            userLocation[1], userLocation[0],
            clinic.lat, clinic.lng
          )
        }))
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
    }

    setFilteredClinics(filtered)
    
    // Set nearest clinic
    if (filtered.length > 0 && userLocation) {
      setNearestClinic(filtered[0])
    }
  }, [showOnlyOpen, clinics, serviceFilter, ratingFilter, distanceFilter, userLocation])


  // Add clinic markers to map with clustering and enhanced popups
  useEffect(() => {
    if (!map || filteredClinics.length === 0) return
    
    // Wait for map to be fully loaded
    if (!map.loaded()) {
      map.once('load', () => {
        // Retry after map loads
        setTimeout(() => {
          if (map && filteredClinics.length > 0) {
            // This will be handled by the effect running again
          }
        }, 100)
      })
      return
    }

    // Clear existing markers
    mapMarkers.forEach(marker => marker.remove())
    setMapMarkers([])
    
    // Remove existing source and layers if they exist
    if (map.getSource('clinics')) {
      if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point')
      if (map.getLayer('cluster-count')) map.removeLayer('cluster-count')
      if (map.getLayer('clusters')) map.removeLayer('clusters')
      map.removeSource('clinics')
    }

    // Use clustering if more than 10 clinics
    if (filteredClinics.length > 10) {
      // Filter clinics with valid coordinates
      const validClinics = filteredClinics.filter(clinic => 
        clinic.lat && clinic.lng && 
        !isNaN(clinic.lat) && !isNaN(clinic.lng) &&
        clinic.lat >= -90 && clinic.lat <= 90 &&
        clinic.lng >= -180 && clinic.lng <= 180
      )
      
      const geojson = {
        type: 'FeatureCollection',
        features: validClinics.map(clinic => {
          const isOpen = clinic.status === 'open' || clinic.status === 'active';
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [clinic.lng, clinic.lat]
            },
            properties: {
              id: clinic.id,
              name: clinic.name,
              status: clinic.status,
              is_active: isOpen,
              services: clinic.services || [],
              address: clinic.address,
              phone: clinic.phone,
              distance: clinic.distance,
              isNearest: nearestClinic?.id === clinic.id
            }
          }
        })
      }

      if (!map.getSource('clinics')) {
        map.addSource('clinics', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        })

        // Cluster circles
        map.addLayer({
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

        // Cluster count labels
        map.addLayer({
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

        // Individual clinic markers
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'clinics',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['get', 'isNearest'],
              '#10B981', // Green for nearest
              ['get', 'is_active'],
              '#10B981', // Green for open/active clinics
              '#EF4444'  // Red for closed/inactive clinics
            ],
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        })

        // Click cluster to zoom
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
          const clusterId = features[0].properties.cluster_id
          map.getSource('clinics').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            })
          })
        })

        // Click clinic marker
        map.on('click', 'unclustered-point', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice()
          const properties = e.features[0].properties
          const clinic = filteredClinics.find(c => c.id === properties.id)
          
          if (clinic) {
            setSelectedClinic(clinic)
            showClinicPopup(map, coordinates, clinic)
          }
        })

        map.on('mouseenter', 'unclustered-point', () => {
          map.getCanvas().style.cursor = 'pointer'
        })

        map.on('mouseleave', 'unclustered-point', () => {
          map.getCanvas().style.cursor = ''
        })
      } else {
        map.getSource('clinics').setData(geojson)
      }
    } else {
      // Individual markers (no clustering for small numbers)
      // Filter clinics with valid coordinates
      const validClinics = filteredClinics.filter(clinic => 
        clinic.lat && clinic.lng && 
        !isNaN(clinic.lat) && !isNaN(clinic.lng) &&
        clinic.lat >= -90 && clinic.lat <= 90 &&
        clinic.lng >= -180 && clinic.lng <= 180
      )
      
      const newMarkers = validClinics.map(clinic => {
        const isNearest = nearestClinic?.id === clinic.id
        // Determine marker color based on status
        const isOpen = clinic.status === 'open' || clinic.status === 'active';
        const markerColor = isNearest ? '#10B981' : (isOpen ? '#10B981' : '#EF4444');
        
        const markerElement = document.createElement('div')
        markerElement.innerHTML = `
          <div style="
            background-color: ${markerColor};
            width: ${isNearest ? '32px' : '24px'};
            height: ${isNearest ? '32px' : '24px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
            ${isNearest ? 'animation: pulse 2s infinite;' : ''}
            transition: transform 0.2s;
          "></div>
        `

        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([clinic.lng, clinic.lat])
          .addTo(map)

        // Enhanced popup with directions and booking
        const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
          .setHTML(`
            <div style="min-width: 250px; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${clinic.name}</h3>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.address || ''}</p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.phone || ''}</p>
              <p style="margin: 4px 0;">
                <span style="padding: 2px 8px; background: ${(clinic.status === 'open' || clinic.status === 'active') ? '#10B981' : '#EF4444'}; color: white; border-radius: 12px; font-size: 11px; font-weight: bold;">
                  ${(clinic.status === 'open' || clinic.status === 'active') ? '✓ Open' : '✗ Closed'}
                </span>
                ${clinic.distance !== undefined ? `<span style="margin-left: 8px; font-size: 11px; color: #666;">${clinic.distance.toFixed(1)} km away</span>` : ''}
              </p>
              ${clinic.services && clinic.services.length > 0 ? `<p style="margin: 4px 0; font-size: 11px; color: #666;">Services: ${clinic.services.slice(0, 3).join(', ')}${clinic.services.length > 3 ? '...' : ''}</p>` : ''}
              <div style="margin-top: 8px; display: flex; gap: 4px;">
                <button onclick="window.getDirectionsToClinic(${clinic.lng}, ${clinic.lat})" style="padding: 4px 8px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                  Get Directions
                </button>
                <button onclick="window.bookClinicAppointment(${clinic.id})" style="padding: 4px 8px; background: #10B981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                  Book Now
                </button>
              </div>
            </div>
          `)

        marker.setPopup(popup)

        // Hover effects
        marker.getElement().addEventListener('mouseenter', () => {
          marker.getElement().style.transform = 'scale(1.2)'
        })

        marker.getElement().addEventListener('mouseleave', () => {
          marker.getElement().style.transform = 'scale(1)'
        })

        // Click marker to select clinic
        marker.getElement().addEventListener('click', () => {
          setSelectedClinic(clinic)
        })

        return marker
      })

      setMapMarkers(newMarkers)
    }

    // Add global functions for popup buttons
    window.getDirectionsToClinic = (lng, lat) => {
      if (userLocation) {
        showRouteToClinic(map, userLocation, [lng, lat])
      } else {
        alert('Please enable location services to get directions')
      }
    }

    window.bookClinicAppointment = (clinicId) => {
      const clinic = filteredClinics.find(c => c.id === clinicId)
      if (clinic) {
        setSelectedClinic(clinic)
        window.location.href = `/book/${clinicId}`
      }
    }
  }, [filteredClinics, map, nearestClinic, userLocation])




  // Show route to clinic
  const showRouteToClinic = (mapInstance, start, end) => {
    if (!mapInstance || !mapboxgl.accessToken) return

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes[0]) {
          const route = data.routes[0].geometry

          if (!mapInstance.getSource('route')) {
            mapInstance.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: route
              }
            })

            mapInstance.addLayer({
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
            mapInstance.getSource('route').setData({
              type: 'Feature',
              geometry: route
            })
          }
        }
      })
      .catch(err => console.error('Error fetching route:', err))
  }

  // Show clinic popup
  const showClinicPopup = (mapInstance, coordinates, clinic) => {
    const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
      .setLngLat(coordinates)
      .setHTML(`
        <div style="min-width: 250px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${clinic.name}</h3>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.address || ''}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${clinic.phone || ''}</p>
          <p style="margin: 4px 0;">
            <span style="padding: 2px 8px; background: ${(clinic.status === 'open' || clinic.status === 'active') ? '#10B981' : '#EF4444'}; color: white; border-radius: 12px; font-size: 11px; font-weight: bold;">
              ${(clinic.status === 'open' || clinic.status === 'active') ? '✓ Open' : '✗ Closed'}
            </span>
            ${clinic.distance !== undefined ? `<span style="margin-left: 8px; font-size: 11px; color: #666;">${clinic.distance.toFixed(1)} km away</span>` : ''}
          </p>
          ${clinic.services && clinic.services.length > 0 ? `<p style="margin: 4px 0; font-size: 11px; color: #666;">Services: ${clinic.services.slice(0, 3).join(', ')}${clinic.services.length > 3 ? '...' : ''}</p>` : ''}
          <div style="margin-top: 8px; display: flex; gap: 4px;">
            <button onclick="window.getDirectionsToClinic(${clinic.lng}, ${clinic.lat})" style="padding: 4px 8px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              Get Directions
            </button>
            <button onclick="window.bookClinicAppointment(${clinic.id})" style="padding: 4px 8px; background: #10B981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
              Book Now
            </button>
          </div>
        </div>
      `)
      .addTo(mapInstance)
  }

  const handleMyLocation = () => {
    getUserLocation().then((coords) => {
      if (map && coords) {
        map.flyTo({
          center: coords,
          zoom: 15,
          duration: 1000
        });
        addUserMarker(coords);
      }
    }).catch((error) => {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please enable location services in your browser settings.');
    });
  };

  return (
    <div className="min-h-screen flex flex-col h-screen">
      {/* Header with search and controls */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter address or zip code..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMyLocation}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                📍 My Location
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                📋
              </button>
            </div>
          </div>
          
          {/* Location permission status */}
          {locationPermission !== 'granted' && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              {locationPermission === 'denied' && (
                <span>Location access denied. Please enable location in your browser settings to find nearby clinics.</span>
              )}
              {locationPermission === 'unsupported' && (
                <span>Location services not supported by your browser.</span>
              )}
              {locationPermission === 'prompt' && (
                <span>Allow location access to find clinics near you.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row relative h-full">
        {/* Sidebar - Desktop: 30-35%, Mobile: Slide-up drawer */}
        <div className={`
          ${sidebarOpen ? 'translate-y-0' : 'translate-y-full'} 
          md:translate-y-0 md:translate-x-0
          fixed md:relative inset-x-0 md:inset-x-auto bottom-0 md:bottom-auto
          w-full md:w-[36%] lg:w-[30%] max-w-sm h-96 md:h-full 
          bg-white overflow-y-auto z-40 md:z-10
          transition-transform duration-300 ease-in-out
          border-t md:border-t-0 md:border-r border-gray-200 shadow-lg md:shadow-none
        `}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {filteredClinics.length} {showOnlyOpen ? 'open' : ''} clinics found
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="mb-4 space-y-3">
              {/* Open/Closed Filter */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyOpen}
                    onChange={(e) => setShowOnlyOpen(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Show only open clinics
                  </span>
                </label>
              </div>

              {/* Distance Filter */}
              {userLocation && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance Filter
                  </label>
                  <select
                    value={distanceFilter || ''}
                    onChange={(e) => setDistanceFilter(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="">All distances</option>
                    <option value="1">Within 1 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                  </select>
                </div>
              )}

              {/* Service Filter */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {['Dental', 'General', 'Emergency', 'Surgery', 'Pediatrics'].map(service => (
                    <label key={service} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceFilter.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServiceFilter([...serviceFilter, service])
                          } else {
                            setServiceFilter(serviceFilter.filter(s => s !== service))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-xs text-gray-600">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="0">Any rating</option>
                  <option value="3">3+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredClinics.map(clinic => (
                <div 
                  key={clinic.id} 
                  className={`
                    border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer
                    ${selectedClinic === clinic ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                    ${nearestClinic === clinic ? 'border-green-500 bg-green-50' : ''}
                  `}
                  onClick={() => {
                    setSelectedClinic(clinic);
                    // Pan map to clinic location
                    if (map && clinic.lat && clinic.lng) {
                      map.flyTo({
                        center: [clinic.lng, clinic.lat],
                        zoom: 15,
                        duration: 1000
                      });
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{clinic.name}</h3>
                      {(clinic.status === 'open' || clinic.status === 'active') && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          [Open]
                        </span>
                      )}
                      {(clinic.status === 'closed' || clinic.status === 'inactive') && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          [Closed]
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {clinic.distance ? `${clinic.distance.toFixed(1)} km` : '--'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{clinic.address}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      ⭐ {clinic.rating > 0 ? clinic.rating.toFixed(1) : 'N/A'}
                    </span>
                    {clinic.doctor_count > 0 && (
                      <span className="flex items-center gap-1">
                        👨‍⚕️ {clinic.doctor_count} {clinic.doctor_count === 1 ? 'Doctor' : 'Doctors'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {clinic.services.map(service => (
                      <span 
                        key={service}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  
                  <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map - Desktop: 25%, Mobile: Full screen */}
        <div className="flex-1 relative w-full md:w-[25%] lg:w-[25%] h-full min-h-[648px] md:min-h-[70vh] overflow-hidden">
          <div id="map" className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%', margin: 0, padding: 0 }} />
          
          {/* Map Style Toggle */}
          <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Map Style</label>
            <select
              value={mapStyle}
              onChange={(e) => {
                setMapStyle(e.target.value)
                if (map) {
                  map.setStyle(e.target.value)
                }
              }}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="mapbox://styles/mapbox/streets-v12">Streets</option>
              <option value="mapbox://styles/mapbox/satellite-v9">Satellite</option>
              <option value="mapbox://styles/mapbox/light-v11">Light</option>
              <option value="mapbox://styles/mapbox/dark-v11">Dark</option>
            </select>
          </div>

          {/* Find Nearest Clinic Button */}
          <div className="absolute bottom-4 left-4 z-20 bg-white rounded-lg shadow-lg p-3">
            <button
              onClick={findNearestClinic}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              disabled={!userLocation || clinics.length === 0}
            >
              📍 Nearest Location
            </button>
            {nearestClinic && userLocation && (
              <div className="mt-2 text-xs text-gray-600">
                Nearest: {nearestClinic.name} ({nearestClinic.distance?.toFixed(1)} km away)
              </div>
            )}
          </div>
          
          {/* Mobile floating button to open sidebar */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute bottom-4 right-4 z-30 bg-white p-3 rounded-full shadow-lg border border-gray-200"
          >
            📋
          </button>
        </div>
      </div>

      {/* Add pulse animation styles and map fixes */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* Remove grey bars from map */
        #map {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        
        .mapboxgl-map {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
        }
        
        .mapboxgl-canvas-container {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
        
        .mapboxgl-canvas {
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
        
        .mapboxgl-canvas-container.mapboxgl-touch-zoom-rotate .mapboxgl-canvas {
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Remove any potential grey overlay */
        .mapboxgl-map::after {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

export default FindClinics
