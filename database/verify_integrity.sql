-- Database Integrity Verification Queries
-- Run these queries to verify clinic-manager relationships and data integrity

-- 1. Clinic-Manager Linkage Verification
-- Check which clinics are managed by which managers
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    u.id as manager_id,
    u.email as manager_email,
    u.first_name || ' ' || u.last_name as manager_name,
    u.role as manager_role
FROM clinics c 
LEFT JOIN users u ON c.clinic_manager_id = u.id 
WHERE u.role IN ('clinic_manager', 'manager')
ORDER BY c.name;

-- Alternative: Check via clinic_manager_assignments table
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    u.id as manager_id,
    u.email as manager_email,
    u.first_name || ' ' || u.last_name as manager_name,
    cma.permission_level
FROM clinics c
JOIN clinic_manager_assignments cma ON c.id = cma.clinic_id
JOIN users u ON cma.manager_id = u.id
WHERE u.role IN ('clinic_manager', 'manager')
ORDER BY c.name, u.email;

-- 2. Clinics without Services
-- Find clinics that don't have any services assigned
SELECT 
    c.id,
    c.name,
    c.address,
    c.status
FROM clinics c 
LEFT JOIN service_types st ON c.id = st.clinic_id 
WHERE st.id IS NULL
ORDER BY c.name;

-- 3. Appointments without Clinic Context
-- Find appointments that are missing clinic_id (should not exist)
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.user_id,
    a.clinic_id
FROM appointments a 
WHERE a.clinic_id IS NULL
ORDER BY a.appointment_date DESC;

-- 4. Doctors without Clinic Assignment
-- Find doctors that are not assigned to any clinic
SELECT 
    d.id,
    d.user_id,
    u.first_name || ' ' || u.last_name as doctor_name,
    d.specialization,
    d.clinic_id
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.clinic_id IS NULL
ORDER BY doctor_name;

-- 5. Services without Clinic Assignment
-- Find services that are not linked to any clinic
SELECT 
    st.id,
    st.name,
    st.description,
    st.clinic_id
FROM service_types st
WHERE st.clinic_id IS NULL
ORDER BY st.name;

-- 6. Clinics without Coordinates (for map)
-- Find clinics missing latitude/longitude
SELECT 
    c.id,
    c.name,
    c.address,
    c.latitude,
    c.longitude
FROM clinics c
WHERE c.latitude IS NULL OR c.longitude IS NULL
ORDER BY c.name;

-- 7. Appointments by Clinic (for verification)
-- Count appointments per clinic to verify filtering
SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    COUNT(a.id) as appointment_count,
    COUNT(CASE WHEN a.status = 'pending_approval' THEN 1 END) as pending_count,
    COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed_count
FROM clinics c
LEFT JOIN appointments a ON c.id = a.clinic_id
GROUP BY c.id, c.name
ORDER BY appointment_count DESC;

-- 8. Manager-Clinic Assignment Summary
-- Summary of how many clinics each manager manages
SELECT 
    u.id as manager_id,
    u.email as manager_email,
    u.first_name || ' ' || u.last_name as manager_name,
    COUNT(DISTINCT cma.clinic_id) as clinics_managed,
    STRING_AGG(c.name, ', ') as clinic_names
FROM users u
LEFT JOIN clinic_manager_assignments cma ON u.id = cma.manager_id
LEFT JOIN clinics c ON cma.clinic_id = c.id
WHERE u.role IN ('clinic_manager', 'manager')
GROUP BY u.id, u.email, u.first_name, u.last_name
ORDER BY clinics_managed DESC;

-- 9. Verify Clinic Status Values
-- Check for inconsistent status values
SELECT 
    c.id,
    c.name,
    c.status,
    CASE 
        WHEN c.status IN ('open', 'active') THEN 'Should be open'
        WHEN c.status IN ('closed', 'inactive') THEN 'Should be closed'
        ELSE 'Unknown status'
    END as status_interpretation
FROM clinics c
ORDER BY c.status, c.name;

-- 10. Check for Orphaned Records
-- Appointments with invalid clinic_id
SELECT 
    a.id as appointment_id,
    a.clinic_id,
    a.appointment_date,
    a.status
FROM appointments a
LEFT JOIN clinics c ON a.clinic_id = c.id
WHERE c.id IS NULL;

-- Doctors with invalid clinic_id
SELECT 
    d.id as doctor_id,
    d.clinic_id,
    d.specialization
FROM doctors d
LEFT JOIN clinics c ON d.clinic_id = c.id
WHERE c.id IS NULL;

-- Services with invalid clinic_id
SELECT 
    st.id as service_id,
    st.clinic_id,
    st.name
FROM service_types st
LEFT JOIN clinics c ON st.clinic_id = c.id
WHERE c.id IS NULL;

