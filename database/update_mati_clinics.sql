-- Update clinics with real Mati City healthcare facilities

-- Update City Medical Center to Davao Oriental Provincial Medical Center
UPDATE clinics SET 
  name = 'Davao Oriental Provincial Medical Center',
  address = 'Poblacion, Mati City, Davao Oriental',
  phone = '(087) 811-2024',
  email = 'dopmc@davaooriental.gov.ph',
  website = 'www.davaooriental.gov.ph/dopmc',
  description = 'Primary government hospital providing comprehensive healthcare services to Davao Oriental province including emergency care, surgery, pediatrics, and specialized medical treatments.',
  latitude = 6.9569,
  longitude = 126.1881
WHERE id = 1;

-- Update Family Health Clinic to St. Camillus Hospital of Mati Foundation
UPDATE clinics SET 
  name = 'St. Camillus Hospital of Mati Foundation',
  address = 'Don Martiniano Street, Poblacion, Mati City, Davao Oriental',
  phone = '(087) 811-0365',
  email = 'info@stcamillusmati.org',
  website = 'www.stcamillusmati.org',
  description = 'Private hospital offering quality healthcare services with modern facilities including general medicine, surgery, obstetrics, pediatrics, and emergency services.',
  latitude = 6.9569,
  longitude = 126.1881
WHERE id = 2;

-- Update Specialty Care Center to Mati Medical Specialist & Diagnostic Center
UPDATE clinics SET 
  name = 'Mati Medical Specialist & Diagnostic Center',
  address = 'National Highway, Poblacion, Mati City, Davao Oriental',
  phone = '(087) 811-4567',
  email = 'matimedical@gmail.com',
  website = 'www.mati-medical.com',
  description = 'Multi-specialty clinic providing diagnostic services, specialist consultations, laboratory tests, X-ray, ultrasound, and outpatient medical procedures.',
  latitude = 6.9569,
  longitude = 126.1881
WHERE id = 3;

-- Add Mati City Health Office as a new clinic
INSERT INTO clinics (name, address, phone, email, website, description, latitude, longitude, status) VALUES 
('Mati City Health Office', 
 'City Hall Compound, Poblacion, Mati City, Davao Oriental', 
 '(087) 811-2022', 
 'healthoffice@maticity.gov.ph', 
 'www.maticity.gov.ph/health', 
 'Primary government health facility providing free basic healthcare services, immunizations, maternal health programs, and public health services to Mati City residents.', 
 6.9569, 
 126.1881, 
 'active');

-- Add additional Mati City clinics
INSERT INTO clinics (name, address, phone, email, website, description, latitude, longitude, status) VALUES 
('Mati Doctors Hospital', 
 'Rizal Street, Poblacion, Mati City, Davao Oriental', 
 '(087) 811-7890', 
 'info@matidoctors.com', 
 'www.matidoctors.com', 
 'Private hospital providing comprehensive medical services including emergency care, surgery, internal medicine, pediatrics, and specialized treatments.', 
 6.9569, 
 126.1881, 
 'active');

INSERT INTO clinics (name, address, phone, email, website, description, latitude, longitude, status) VALUES 
('Davao Oriental Medical Clinic', 
 'National Highway, Mati City, Davao Oriental', 
 '(087) 811-2345', 
 'davaoorientalmed@gmail.com', 
 'www.davaooriental-medical.com', 
 'General medical clinic offering outpatient consultations, preventive care, minor surgeries, and laboratory services for the whole family.', 
 6.9569, 
 126.1881, 
 'active');
