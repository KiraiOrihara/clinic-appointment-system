import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Star, Clock, Search, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FreeMap from '../components/FreeMap'
import { clinicService } from '../services/api'

const DORSU_COORDINATES = { lat: 6.9322763, lng: 126.2536529 };

const FindClinics = () => {
  const [clinics, setClinics] = useState([])
  const [mapClinics, setMapClinics] = useState([])
  const [searchAddress, setSearchAddress] = useState('Mati City, Davao Oriental')
  const [searchQuery, setSearchQuery] = useState('Mati City, Davao Oriental')
  const [loading, setLoading] = useState(true)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate()

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  const handleBookNow = (clinicId) => {
    if (isAuthenticated) {
      navigate(`/book/${clinicId}`)
    } else {
      navigate('/login', { state: { from: `/book/${clinicId}` } })
    }
  }

  // Fetch clinics from database
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true)
        const response = await clinicService.getAllClinics()
        setClinics(response || [])
      } catch (error) {
        console.error('Error fetching clinics:', error)
        setClinics([])
      } finally {
        setLoading(false)
      }
    }

    const fetchMapData = async () => {
      try {
        const data = await clinicService.getMapData()
        setMapClinics(data || [])
      } catch (error) {
        console.error('Error fetching map data:', error)
      }
    }

    fetchClinics()
    fetchMapData()
  }, [refreshKey])

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleSearch = (e) => {
    e?.preventDefault()
    setIsSearching(true)
    setSearchQuery(searchAddress)
    setTimeout(() => setIsSearching(false), 500)
  }

  const handleClinicClick = (clinic) => {
    setSelectedClinic(clinic)
    if (clinic.latitude && clinic.longitude) {
      setMapCenter({ lat: parseFloat(clinic.latitude), lng: parseFloat(clinic.longitude) })
    }
    // Scroll to map on mobile
    const mapElement = document.querySelector('.lg\\:col-span-1')
    if (mapElement && window.innerWidth < 1024) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const locateNearestClinic = () => {
    if (!navigator.geolocation) {
      alert('Location not supported in this browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const userLoc = { lat: latitude, lng: longitude }
        setUserLocation(userLoc)
        setMapCenter(userLoc)

        const withDistance = mapClinics.map(c => {
          if (!c.latitude || !c.longitude) return { ...c, distance: Infinity }
          const toRad = (v) => (v * Math.PI) / 180
          const R = 6371
          const dLat = toRad(c.latitude - userLoc.lat)
          const dLon = toRad(c.longitude - userLoc.lng)
          const a = Math.sin(dLat/2)**2 + Math.cos(toRad(userLoc.lat)) * Math.cos(toRad(c.latitude)) * Math.sin(dLon/2)**2
          const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          return { ...c, distance: d }
        }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))

        if (withDistance.length && withDistance[0].distance !== Infinity) {
          const nearest = withDistance[0]
          setSelectedClinic(nearest)
          setSearchQuery(nearest.name)
          setMapCenter({ lat: parseFloat(nearest.latitude), lng: parseFloat(nearest.longitude) })
        }
      },
      (err) => {
        console.error('Geolocation error', err)
        alert('Unable to get your location. Please enable location access.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const refreshData = () => {
    // Clear all active searches, filters, and highlighted clinics
    setSearchAddress('');
    setSearchQuery('');
    setSelectedClinic(null);
    setMapCenter(DORSU_COORDINATES);
    setRefreshKey((k) => k + 1)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-success">Open Now</Badge>
      case 'busy':
        return <Badge className="bg-warning">Busy</Badge>
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Find Healthcare Clinics
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Discover trusted medical providers in Mati City
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-background px-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Enter location or clinic name" 
                  className="border-0 p-0 focus-visible:ring-0 flex-1"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button size="lg" className="gap-2" onClick={handleSearch} disabled={isSearching}>
                <Search className="h-5 w-5" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map - primary */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <Card className="border-2 border-border shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-lg">Clinic Locations</CardTitle>
                  <CardDescription>
                    Click on a clinic to see details on the map
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={refreshData}>
                    🔄 Refresh
                  </Button>
                  <Button size="sm" variant="outline" onClick={locateNearestClinic}>
                    📍 Nearest clinic
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const itCoords = { lat: 6.9325, lng: 126.2538 }
                      setUserLocation(itCoords)
                      setMapCenter(itCoords)
                    }}
                  >
                    🎯 My location
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[calc(75vh-80px)] bg-muted rounded-b-xl overflow-hidden">
                  <FreeMap 
                    clinics={mapClinics}
                    selectedClinic={selectedClinic}
                    onClinicSelect={setSelectedClinic}
                    center={mapCenter}
                    zoom={13}
                    useMapDataEndpoint={mapClinics.length === 0}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clinics List */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2 max-h-[85vh] overflow-y-auto pr-2">
            <div className="mb-6 sticky top-0 bg-gradient-subtle border-2 border-border shadow-lg rounded-xl p-4">
              <h2 className="text-2xl font-bold text-foreground">
                {filteredClinics.length} clinics found
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-2 border-border shadow-lg rounded-xl">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="flex gap-4">
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClinics.map((clinic) => (
                  <Card key={clinic.id} className={`border-2 border-border shadow-lg rounded-xl transition-all hover:shadow-xl cursor-pointer ${selectedClinic?.id === clinic.id ? 'ring-2 ring-primary' : ''}`} onClick={() => handleClinicClick(clinic)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{clinic.name}</CardTitle>
                            {getStatusBadge(clinic.status)}
                          </div>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {clinic.address}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-semibold">{clinic.rating}</span>
                          <span className="text-sm text-muted-foreground">Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{clinic.phone}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Doctors:</p>
                        <div className="space-y-1">
                          {clinic.doctors && clinic.doctors.length > 0 ? (
                            clinic.doctors.slice(0, 5).map((doctor, idx) => {
                              let name =
                                doctor.display_name ||
                                doctor.displayName ||
                                doctor.name ||
                                (doctor.user && [doctor.user.first_name, doctor.user.last_name].filter(Boolean).join(' ').trim()) ||
                                [doctor.first_name, doctor.last_name].filter(Boolean).join(' ').trim() ||
                                `Doctor ${idx + 1}`;
                              
                              // Add "Dr." prefix if not already present
                              if (name && !name.startsWith('Dr.') && !name.startsWith('Dr ')) {
                                name = `Dr. ${name}`;
                              }
                              
                              return (
                                <p key={doctor.id ?? idx} className="text-xs text-muted-foreground">
                                  {name}
                                </p>
                              );
                            })
                          ) : (
                            <p className="text-xs text-muted-foreground">No doctors available</p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {clinic.services && clinic.services.length > 0 ? (
                            clinic.services.map(service => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service.charAt(0).toUpperCase() + service.slice(1)}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">No services available</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end">
                        <Button size="sm" onClick={() => handleBookNow(clinic.id)}>
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default FindClinics
