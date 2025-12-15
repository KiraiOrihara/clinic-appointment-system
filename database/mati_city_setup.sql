-- Mati City, Davao Oriental Database Setup
-- Sets up default location and sample clinics for Mati City area

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Set Default Location in Database
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES (
    'default_location', 
    '{"lat": 6.95, "lng": 126.23, "city": "Mati City", "region": "Davao Oriental", "country": "Philippines", "search_radius": 20}',
    'Default search location centered on Mati City, Davao Oriental'
) ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = CURRENT_TIMESTAMP;

-- Add Mati City Clinics (Sample Data)
INSERT INTO clinics (name, address, phone, email, website, description, latitude, longitude) VALUES
('Mati City Community Hospital', 'Mati City Center, Davao Oriental', '(087) 811-2345', 'info@matichospital.com', 'www.matichospital.com', 'Primary government hospital serving Mati City and surrounding communities with comprehensive healthcare services.', 6.9521, 126.2350),
('Davao Oriental Medical Center', 'Central Mati, Davao Oriental', '(087) 811-6789', 'contact@davomed.com.ph', 'www.davomed.com.ph', 'Private medical center offering advanced healthcare services and specialized treatments in Davao Oriental.', 6.9487, 126.2289),
('Mati Health Clinic', 'Barangay Central, Mati City', '(087) 811-3456', 'matihealth@local.gov.ph', NULL, 'Public health clinic providing basic medical services, vaccinations, and health programs for Mati City residents.', 6.9553, 126.2412),
('St. Camillus Mati Health Center', 'Poblacion, Mati City', '(087) 811-7890', 'stcamillus@health.com', 'www.stcamillusmati.com', 'Private health center offering general practice, pediatric care, and emergency services.', 6.9456, 126.2389),
('Davao Oriental Provincial Hospital', 'Mati City, Davao Oriental', '(087) 811-1111', 'doph@davaooriental.gov.ph', 'www.doph.gov.ph', 'Provincial government hospital providing comprehensive healthcare services to the entire Davao Oriental province.', 6.9501, 126.2334)
ON CONFLICT DO NOTHING;

-- Link clinics to services (General Practice, Emergency, etc.)
INSERT INTO clinic_services (clinic_id, service_id) VALUES
-- Mati City Community Hospital
(4, 1), (4, 2), (4, 11), (4, 12),
-- Davao Oriental Medical Center  
(5, 1), (5, 3), (5, 7), (5, 11),
-- Mati Health Clinic
(6, 1), (6, 11), (6, 12),
-- St. Camillus Mati Health Center
(7, 1), (7, 2), (7, 11),
-- Davao Oriental Provincial Hospital
(8, 1), (8, 2), (8, 4), (8, 5), (8, 11)
ON CONFLICT DO NOTHING;

-- Add clinic availability for Mati City clinics
INSERT INTO clinic_availability (clinic_id, day_of_week, opening_time, closing_time) VALUES
-- Mati City Community Hospital (24/7 Emergency)
(4, 0, '00:00:00', '23:59:59'), -- Sunday
(4, 1, '00:00:00', '23:59:59'), -- Monday
(4, 2, '00:00:00', '23:59:59'), -- Tuesday
(4, 3, '00:00:00', '23:59:59'), -- Wednesday
(4, 4, '00:00:00', '23:59:59'), -- Thursday
(4, 5, '00:00:00', '23:59:59'), -- Friday
(4, 6, '00:00:00', '23:59:59'), -- Saturday
-- Davao Oriental Medical Center
(5, 1, '08:00:00', '20:00:00'), -- Monday
(5, 2, '08:00:00', '20:00:00'), -- Tuesday
(5, 3, '08:00:00', '20:00:00'), -- Wednesday
(5, 4, '08:00:00', '20:00:00'), -- Thursday
(5, 5, '08:00:00', '20:00:00'), -- Friday
(5, 6, '08:00:00', '17:00:00'), -- Saturday
-- Mati Health Clinic
(6, 1, '08:00:00', '17:00:00'), -- Monday
(6, 2, '08:00:00', '17:00:00'), -- Tuesday
(6, 3, '08:00:00', '17:00:00'), -- Wednesday
(6, 4, '08:00:00', '17:00:00'), -- Thursday
(6, 5, '08:00:00', '17:00:00'), -- Friday
(6, 6, '08:00:00', '12:00:00'), -- Saturday
-- St. Camillus Mati Health Center
(7, 1, '08:30:00', '18:30:00'), -- Monday
(7, 2, '08:30:00', '18:30:00'), -- Tuesday
(7, 3, '08:30:00', '18:30:00'), -- Wednesday
(7, 4, '08:30:00', '18:30:00'), -- Thursday
(7, 5, '08:30:00', '18:30:00'), -- Friday
(7, 6, '09:00:00', '15:00:00'), -- Saturday
-- Davao Oriental Provincial Hospital
(8, 0, '00:00:00', '23:59:59'), -- Sunday
(8, 1, '00:00:00', '23:59:59'), -- Monday
(8, 2, '00:00:00', '23:59:59'), -- Tuesday
(8, 3, '00:00:00', '23:59:59'), -- Wednesday
(8, 4, '00:00:00', '23:59:59'), -- Thursday
(8, 5, '00:00:00', '23:59:59'), -- Friday
(8, 6, '00:00:00', '23:59:59')  -- Saturday
ON CONFLICT DO NOTHING;

-- Add sample reviews for Mati City clinics
INSERT INTO reviews (clinic_id, user_id, rating, comment) VALUES
(4, 1, 5, 'Excellent service! The staff is very professional and caring.'),
(4, 2, 4, 'Good facilities but sometimes crowded during peak hours.'),
(5, 1, 5, 'Top-notch medical care with modern equipment.'),
(5, 3, 4, 'Expensive but worth the quality of service.'),
(6, 2, 4, 'Affordable healthcare services for the community.'),
(7, 3, 5, 'Very clean facility and friendly staff.'),
(8, 1, 4, 'Comprehensive services but long wait times.')
ON CONFLICT (clinic_id, user_id) DO NOTHING;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_clinics_mati_location ON clinics(latitude, longitude) 
WHERE latitude BETWEEN 6.9 AND 7.0 AND longitude BETWEEN 126.2 AND 126.3;

-- Create a function to get clinics within a certain radius of Mati City
CREATE OR REPLACE FUNCTION get_mati_city_clinics(radius_km DECIMAL DEFAULT 20)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(255),
    address TEXT,
    phone VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.address,
        c.phone,
        c.latitude,
        c.longitude,
        -- Simple distance calculation (for production, use PostGIS ST_Distance)
        (6371 * acos(
            cos(radians(6.95)) * cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians(126.23)) + 
            sin(radians(6.95)) * sin(radians(c.latitude))
        ))::DECIMAL(10, 2) as distance_km
    FROM clinics c
    WHERE c.status = 'active'
      AND c.latitude IS NOT NULL 
      AND c.longitude IS NOT NULL
      AND (6371 * acos(
            cos(radians(6.95)) * cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians(126.23)) + 
            sin(radians(6.95)) * sin(radians(c.latitude))
        )) <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_mati_city_clinics IS 'Returns all active clinics within specified radius of Mati City center';
