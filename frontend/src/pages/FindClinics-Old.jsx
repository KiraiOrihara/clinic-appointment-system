import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FreeMap from '../components/FreeMap'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const FindClinics = () => {
  const [map, setMap] = useState(null)
  const [clinics, setClinics] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is required')
      return
    }

    const mapInstance = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // Default to NYC
      zoom: 12
    })

    setMap(mapInstance)

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([longitude, latitude])
          mapInstance.flyTo({ center: [longitude, latitude], zoom: 13 })
          
          // Add user marker
          new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat([longitude, latitude])
            .addTo(mapInstance)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLoading(false)
        }
      )
    }

    setLoading(false)

    return () => mapInstance.remove()
  }, [])

  const mockClinics = [
    {
      id: 1,
      name: 'City Medical Center',
      address: '123 Main St, New York, NY',
      lat: 40.7128,
      lng: -74.0060,
      distance: 0.5,
      services: ['general', 'pediatrics'],
      rating: 4.5,
      waitTime: '15 min'
    },
    {
      id: 2,
      name: 'Family Health Clinic',
      address: '456 Oak Ave, New York, NY',
      lat: 40.7580,
      lng: -73.9855,
      distance: 1.2,
      services: ['general', 'dental'],
      rating: 4.2,
      waitTime: '30 min'
    },
    {
      id: 3,
      name: 'Specialty Care Center',
      address: '789 Elm St, New York, NY',
      lat: 40.7489,
      lng: -73.9680,
      distance: 2.1,
      services: ['cardiology', 'dermatology'],
      rating: 4.8,
      waitTime: '45 min'
    }
  ]

  useEffect(() => {
    setClinics(mockClinics)
  }, [])

  const filteredClinics = clinics

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-sm border-b">
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
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 h-96 md:h-full bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {filteredClinics.length} clinics found
            </h2>
            
            <div className="space-y-4">
              {filteredClinics.map(clinic => (
                <div key={clinic.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{clinic.name}</h3>
                    <span className="text-sm text-gray-500">{clinic.distance} mi</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{clinic.address}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      ⭐ {clinic.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {clinic.waitTime}
                    </span>
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

        <div className="flex-1 relative">
          <div id="map" className="absolute inset-0" />
        </div>
      </div>
    </div>
  )
}

export default FindClinics
