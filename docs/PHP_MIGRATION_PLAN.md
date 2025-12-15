## PHP Migration Plan (Laravel + MySQL) — Fastest Parity with Existing React UI

This plan replaces the Node/Express/Postgres backend with a Laravel (PHP 8.2+) + MySQL stack while keeping the current React frontend unchanged except for updating `API_BASE_URL`.

### Stack & Setup
- Framework: Laravel 11 (PHP 8.2+)
- Auth: Session-based (Laravel session driver, cookie-based), `auth` + `admin` middleware
- DB: MySQL (phpMyAdmin), `utf8mb4`
- Mail: SMTP (Resend or other)
- PDF: `barryvdh/laravel-dompdf`
- Queues: database driver (for email send)
- Storage: `storage/app/receipts/{appointmentId}.pdf`, return URL in API responses

### Install / Scaffold
```bash
composer create-project laravel/laravel clinic-booking-php
cd clinic-booking-php
composer require barryvdh/laravel-dompdf
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
# optional if using Sanctum session auth style
composer require laravel/sanctum
php artisan migrate
php artisan storage:link
```

### .env example (key fields)
```
APP_URL=http://localhost:8000
SESSION_DRIVER=file
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clinic_booking
DB_USERNAME=youruser
DB_PASSWORD=yourpass

MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_resend_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=appointments@yourdomain.com
MAIL_FROM_NAME="Clinic Booking"
```

### Routes (API surface parity)
`routes/api.php`
```php
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth');
});

Route::get('/clinics/mati-city', [ClinicController::class, 'matiCity']);
Route::get('/clinics', [ClinicController::class, 'index']);
Route::get('/clinics/{id}', [ClinicController::class, 'show']);
Route::get('/clinics/{id}/availability', [ClinicController::class, 'availability']);

Route::middleware('auth')->group(function () {
    Route::get('/appointments/my', [AppointmentController::class, 'myAppointments']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::patch('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::patch('/appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::post('/appointments/{id}/resend-receipt', [AppointmentController::class, 'resendReceipt']);
});

Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/appointments', [AdminController::class, 'appointments']);
    Route::delete('/appointments/{id}', [AdminController::class, 'deleteAppointment']);
    Route::patch('/appointments/{id}/cancel', [AdminController::class, 'cancelAppointment']);
    Route::get('/clinics', [AdminController::class, 'clinics']);
    Route::post('/clinics', [AdminController::class, 'storeClinic']);
    Route::put('/clinics/{id}', [AdminController::class, 'updateClinic']);
    Route::delete('/clinics/{id}', [AdminController::class, 'deleteClinic']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
});
```

### Migrations (MySQL-ready key tables)
- `users`, `services`, `clinics`, `clinic_services`, `clinic_availability`, `appointments`, `reviews`, `admin_logs`
- Indices: email, role, clinic status, appointment (clinic_id, appointment_date, appointment_time), user, status
- Double-booking prevention: BEFORE INSERT/UPDATE trigger on `appointments` to ensure no non-cancelled duplicate time slot per clinic.

Example `appointments` table (migration sketch):
```php
Schema::create('appointments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('clinic_id')->constrained()->restrictOnDelete();
    $table->foreignId('user_id')->constrained()->restrictOnDelete();
    $table->string('service');
    $table->date('appointment_date');
    $table->time('appointment_time');
    $table->string('first_name');
    $table->string('last_name');
    $table->string('email');
    $table->string('phone');
    $table->date('date_of_birth')->nullable();
    $table->text('reason')->nullable();
    $table->string('insurance')->nullable();
    $table->enum('status', ['confirmed', 'completed', 'cancelled', 'no-show'])->default('confirmed');
    $table->text('receipt_url')->nullable();
    $table->text('cancellation_reason')->nullable();
    $table->timestamp('cancelled_at')->nullable();
    $table->timestamps();
    $table->index(['clinic_id', 'appointment_date', 'appointment_time']);
});
```

### Core Controllers/Services (behavior parity)
- `AuthController`: register/login/logout/me using sessions; bcrypt via Laravel hashing.
- `ClinicController`: list, show (with services, availability, reviews), availability generation (30-min slots), Mati City preset.
- `AppointmentController`: create (slot conflict check, create record, generate PDF, store receipt URL, send email), my appointments, show, cancel (no past cancel, already cancelled guard), reschedule (no past, conflict check), resend receipt email.
- `AdminController`: stats (counts + recent 5 appointments), appointments with filters (status, clinicId, date range), delete/cancel appointment, clinic CRUD (with services + availability), users list/delete.

### PDFs & Email
- Use DomPDF view `resources/views/pdf/receipt.blade.php`.
- Store to `storage/app/receipts/{id}.pdf`, save URL in appointment.
- Mailables: `AppointmentConfirmationMail` (for create/resend), `AppointmentCancelledMail` (optional).
- Queue mail jobs with `database` queue driver for reliability.

### React frontend change
- Update `frontend/src/services/api.js`:
```js
const API_BASE_URL = 'http://localhost:8000/api'; // Laravel base
```
- Keep all endpoint paths identical; cookies must be allowed (`credentials: 'include'` already set).

### Smoke-test checklist
- Register/login/logout/me.
- Clinics list, detail, availability, Mati City preset.
- Book appointment (conflict check), receipt URL present, email sent.
- My appointments list/detail; cancel (no past), reschedule (no past, conflict guard).
- Resend receipt works.
- Admin: stats, appointments filters, clinic CRUD, user list/delete, appointment delete/cancel.
- PDF saved to storage and URL returned.

### Deployment notes
- Use PHP-FPM + Nginx/Apache; set `APP_URL` correctly.
- Run `php artisan migrate --seed`.
- Set correct `SESSION_DOMAIN` and `SESSION_SECURE_COOKIE` for prod.
- Point React env `API_BASE_URL` to the deployed Laravel `/api`.

This document is a concise blueprint to stand up the Laravel backend with full feature parity while leaving the React UI intact.

