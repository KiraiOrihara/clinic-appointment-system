-- Clinic Booking System Database Schema
-- PostgreSQL with PostGIS support for spatial queries

-- Enable PostGIS extension (optional)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table (predefined medical services)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinics table
CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinic-Service relationship (many-to-many)
CREATE TABLE clinic_services (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE(clinic_id, service_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinic availability (operating hours)
CREATE TABLE clinic_availability (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday, etc.
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    UNIQUE(clinic_id, day_of_week),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE RESTRICT,
    user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    service VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    reason TEXT,
    insurance VARCHAR(255),
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no-show')),
    receipt_url TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, user_id) -- One review per user per clinic
);

-- Admin logs table (for tracking admin actions)
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_clinics_location ON clinics(latitude, longitude);
CREATE INDEX idx_clinics_status ON clinics(status);
CREATE INDEX idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_reviews_clinic ON reviews(clinic_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default services
INSERT INTO services (name, description) VALUES
('General Practice', 'General medical consultations and primary care'),
('Pediatrics', 'Healthcare services for children and infants'),
('Dental', 'Dental care and oral health services'),
('Dermatology', 'Skin care and dermatological treatments'),
('Cardiology', 'Heart and cardiovascular care'),
('Orthopedics', 'Bone and joint care'),
('Gynecology', 'Women''s health and reproductive care'),
('Ophthalmology', 'Eye care and vision services'),
('ENT', 'Ear, nose, and throat specialist'),
('Mental Health', 'Psychological and psychiatric services'),
('Preventive Care', 'Health screenings and preventive medicine'),
('Vaccination', 'Immunizations and vaccine administration');

-- Insert sample clinics (for development)
INSERT INTO clinics (name, address, phone, email, website, description, latitude, longitude) VALUES
('City Medical Center', '123 Main St, New York, NY 10001', '(212) 555-1234', 'info@citymedical.com', 'www.citymedical.com', 'Full-service primary care facility providing comprehensive healthcare services for the whole family.', 40.7128, -74.0060),
('Family Health Clinic', '456 Oak Ave, New York, NY 10002', '(212) 555-5678', 'contact@familyhealth.com', 'www.familyhealth.com', 'Community-focused healthcare with emphasis on preventive care and family medicine.', 40.7580, -73.9855),
('Specialty Care Center', '789 Elm St, New York, NY 10003', '(212) 555-9012', 'referrals@specialty.com', 'www.specialty.com', 'Specialized medical care with expert physicians in various fields.', 40.7489, -73.9680);

-- Insert sample clinic services
INSERT INTO clinic_services (clinic_id, service_id) VALUES
(1, 1), (1, 2), (1, 11), -- City Medical Center
(2, 1), (2, 3), (2, 11), -- Family Health Clinic
(3, 5), (3, 6), (3, 7); -- Specialty Care Center

-- Insert sample clinic availability
INSERT INTO clinic_availability (clinic_id, day_of_week, opening_time, closing_time) VALUES
(1, 1, '08:00:00', '18:00:00'), -- Monday
(1, 2, '08:00:00', '18:00:00'), -- Tuesday
(1, 3, '08:00:00', '18:00:00'), -- Wednesday
(1, 4, '08:00:00', '18:00:00'), -- Thursday
(1, 5, '08:00:00', '18:00:00'), -- Friday
(1, 6, '09:00:00', '14:00:00'), -- Saturday
(2, 1, '08:30:00', '17:30:00'), -- Monday
(2, 2, '08:30:00', '17:30:00'), -- Tuesday
(2, 3, '08:30:00', '17:30:00'), -- Wednesday
(2, 4, '08:30:00', '17:30:00'), -- Thursday
(2, 5, '08:30:00', '17:30:00'), -- Friday
(2, 6, '09:00:00', '13:00:00'), -- Saturday
(3, 1, '09:00:00', '17:00:00'), -- Monday
(3, 2, '09:00:00', '17:00:00'), -- Tuesday
(3, 3, '09:00:00', '17:00:00'), -- Wednesday
(3, 4, '09:00:00', '17:00:00'), -- Thursday
(3, 5, '09:00:00', '17:00:00'), -- Friday;

-- Create default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@clinicbook.com', '$2a$10$rQZ8ZvGQJvKJ8ZvZvZvZvOZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZv', 'Admin', 'User', 'admin');

-- Create function to check appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
    p_clinic_id INTEGER,
    p_date DATE,
    p_time TIME,
    p_appointment_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM appointments
    WHERE clinic_id = p_clinic_id
      AND appointment_date = p_date
      AND appointment_time = p_time
      AND status != 'cancelled'
      AND (p_appointment_id IS NULL OR id != p_appointment_id);
    
    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent double bookings
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT check_appointment_conflict(
        NEW.clinic_id,
        NEW.appointment_date,
        NEW.appointment_time,
        NEW.id
    ) THEN
        RAISE EXCEPTION 'Time slot is already booked';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_double_booking_trigger
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();
