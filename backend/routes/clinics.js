const express = require('express');
const pool = require('../utils/database');

const router = express.Router();

// Get clinic map data for map markers
router.get('/map-data', async (req, res) => {
  try {
    const query = 'SELECT id, name, address, latitude, longitude, status, phone, email FROM clinics ORDER BY name';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get clinic map data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Mati City clinics (default location)
router.get('/mati-city', async (req, res) => {
  try {
    const { radius = 20 } = req.query;
    
    const query = `
      SELECT 
        c.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count,
        (6371 * acos(
          cos(radians(6.95)) * cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians(126.23)) + 
          sin(radians(6.95)) * sin(radians(c.latitude))
        ))::DECIMAL(10, 2) as distance_km
      FROM clinics c
      LEFT JOIN reviews r ON c.id = r.clinic_id
      WHERE c.status = 'active'
        AND c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND (6371 * acos(
          cos(radians(6.95)) * cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians(126.23)) + 
          sin(radians(6.95)) * sin(radians(c.latitude))
        )) <= $1
      GROUP BY c.id
      ORDER BY distance_km
    `;

    const result = await pool.query(query, [radius]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get Mati City clinics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all clinics with optional filtering
router.get('/', async (req, res) => {
  try {
    const { lat, lng, service, radius = 10 } = req.query;

    let query = `
      SELECT 
        c.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM clinics c
      LEFT JOIN reviews r ON c.id = r.clinic_id
    `;

    const params = [];
    const conditions = [];

    if (service && service !== 'all') {
      query += `
        JOIN clinic_services cs ON c.id = cs.clinic_id
        JOIN services s ON cs.service_id = s.id
      `;
      conditions.push(`LOWER(s.name) = LOWER($${params.length + 1})`);
      params.push(service);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY c.id
      ORDER BY c.name
    `;

    const result = await pool.query(query, params);
    let clinics = result.rows;

    // Add doctors and services to each clinic
    for (let clinic of clinics) {
      // Get doctors for this clinic
      const doctorsQuery = `
        SELECT u.first_name, u.last_name, d.specialization
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        WHERE d.clinic_id = $1 AND d.status = 'active'
      `;
      const doctorsResult = await pool.query(doctorsQuery, [clinic.id]);
      clinic.doctors = doctorsResult.rows.map((doctor, index) => ({
        id: `doctor-${clinic.id}-${index}`,
        name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        specialization: doctor.specialization,
        displayName: `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialization})`
      }));

      // Get services for this clinic
      const servicesQuery = `
        SELECT s.name, s.description
        FROM services s
        JOIN clinic_services cs ON s.id = cs.service_id
        WHERE cs.clinic_id = $1
        ORDER BY s.name
      `;
      const servicesResult = await pool.query(servicesQuery, [clinic.id]);
      clinic.services = servicesResult.rows.map(service => service.name);
    }

    // Calculate distances if lat/lng provided
    if (lat && lng) {
      clinics = clinics.map(clinic => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          parseFloat(clinic.latitude),
          parseFloat(clinic.longitude)
        );
        
        return {
          ...clinic,
          distance: distance.toFixed(2)
        };
      });

      // Filter by radius and sort by distance
      clinics = clinics
        .filter(clinic => clinic.distance <= radius)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    res.json(clinics);
  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get clinic by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const clinicQuery = `
      SELECT 
        c.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM clinics c
      LEFT JOIN reviews r ON c.id = r.clinic_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const clinicResult = await pool.query(clinicQuery, [id]);

    if (clinicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const clinic = clinicResult.rows[0];

    // Get services
    const servicesQuery = `
      SELECT s.name, s.description
      FROM clinic_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.clinic_id = $1
    `;

    const servicesResult = await pool.query(servicesQuery, [id]);
    clinic.services = servicesResult.rows;

    // Get availability
    const availabilityQuery = `
      SELECT day_of_week, opening_time, closing_time
      FROM clinic_availability
      WHERE clinic_id = $1
      ORDER BY day_of_week
    `;

    const availabilityResult = await pool.query(availabilityQuery, [id]);
    clinic.availability = availabilityResult.rows;

    // Get reviews
    const reviewsQuery = `
      SELECT r.rating, r.comment, r.created_at, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.clinic_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    const reviewsResult = await pool.query(reviewsQuery, [id]);
    clinic.reviews = reviewsResult.rows;

    res.json(clinic);
  } catch (error) {
    console.error('Get clinic error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get clinic services (public endpoint for booking)
router.get('/:id/services', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if clinic exists and is open
    const clinicCheck = await pool.query(
      'SELECT id, name, status FROM clinics WHERE id = $1',
      [id]
    );
    
    if (clinicCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    
    const clinic = clinicCheck.rows[0];
    
    // Get services for this clinic
    const servicesQuery = `
      SELECT s.id, s.name, s.description
      FROM services s
      JOIN clinic_services cs ON s.id = cs.service_id
      WHERE cs.clinic_id = $1
      ORDER BY s.name
    `;
    
    const servicesResult = await pool.query(servicesQuery, [id]);
    
    res.json({
      services: servicesResult.rows,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        status: clinic.status
      }
    });
  } catch (error) {
    console.error('Get clinic services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available time slots for a clinic on a specific date
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get clinic's operating hours
    const availabilityQuery = `
      SELECT day_of_week, opening_time, closing_time
      FROM clinic_availability
      WHERE clinic_id = $1
    `;

    const availabilityResult = await pool.query(availabilityQuery, [id]);

    if (availabilityResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clinic availability not found' });
    }

    // Get day of week for the requested date
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayAvailability = availabilityResult.rows.find(
      row => row.day_of_week === dayOfWeek
    );

    if (!dayAvailability) {
      return res.json([]); // Clinic closed on this day
    }

    // Get existing appointments for this date
    const appointmentsQuery = `
      SELECT appointment_time
      FROM appointments
      WHERE clinic_id = $1 AND DATE(appointment_date) = $2 AND status != 'cancelled'
    `;

    const appointmentsResult = await pool.query(appointmentsQuery, [id, date]);
    const bookedTimes = appointmentsResult.rows.map(row => row.appointment_time);

    // Generate available time slots (30-minute intervals)
    const availableSlots = generateTimeSlots(
      dayAvailability.opening_time,
      dayAvailability.closing_time,
      bookedTimes
    );

    res.json(availableSlots);
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to generate time slots
function generateTimeSlots(openingTime, closingTime, bookedTimes) {
  const slots = [];
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMin = openMin;
  
  while (
    currentHour < closeHour || 
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    
    if (!bookedTimes.includes(timeString)) {
      slots.push(timeString);
    }
    
    // Add 30 minutes
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin -= 60;
      currentHour++;
    }
  }
  
  return slots;
}

module.exports = router;
