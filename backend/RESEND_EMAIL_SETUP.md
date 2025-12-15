# Resend Email Service Setup Guide

## Overview
This guide explains how to set up and use the Resend API for sending appointment confirmation emails to patients.

## Features
✅ Sends confirmation emails to patient's email from booking form  
✅ Professional HTML email templates  
✅ Automatic confirmation number generation  
✅ Error handling and logging  
✅ Fallback to Gmail if Resend fails  
✅ Email tracking via Resend dashboard  

## Setup Instructions

### 1. Get Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=appointments@clinicfinder.com
```

**Note:** Replace `re_xxxxxxxxxxxxxxxxxxxx` with your actual Resend API key.

### 3. Install Resend Package

```bash
npm install resend
```

## How It Works

### Email Flow
```
User fills booking form
    ↓
Enters email address in "Personal Information" section
    ↓
Submits appointment
    ↓
Backend creates appointment in database
    ↓
Extracts patient email from form data
    ↓
Calls sendAppointmentConfirmationEmail()
    ↓
Resend API sends email to patient's inbox
    ↓
Patient receives confirmation with details
```

### Function Signature

```javascript
const result = await sendAppointmentConfirmationEmail(
  patientEmail,      // Email from booking form
  appointmentData,   // Appointment details from DB
  clinicInfo,        // Clinic information
  patientInfo        // Patient info from form
);
```

### Parameters

**patientEmail** (string)
- Email address entered in the booking form
- Must be valid email format
- This is the recipient of the confirmation email

**appointmentData** (object)
- Contains appointment details from database
- Required fields:
  - `id`: Appointment ID
  - `first_name`: Patient first name
  - `last_name`: Patient last name
  - `appointment_date`: Date of appointment
  - `appointment_time`: Time of appointment
  - `service`: Service type
  - `phone`: Patient phone number
  - `reason`: Reason for visit (optional)

**clinicInfo** (object)
- Contains clinic details
- Required fields:
  - `name`: Clinic name
  - `address`: Clinic address
  - `phone`: Clinic phone number
  - `email`: Clinic email (optional)

**patientInfo** (object)
- Patient information from booking form
- Fields:
  - `firstName`: Patient first name
  - `lastName`: Patient last name
  - `email`: Patient email
  - `phone`: Patient phone

### Return Value

```javascript
{
  success: true,
  messageId: "msg_xxxxxxxxxxxx",
  recipient: "patient@example.com",
  confirmationNumber: "APT-12345-6789",
  timestamp: "2024-12-03T12:00:00.000Z"
}
```

## Email Content

The confirmation email includes:

### Header
- ✓ Appointment Confirmed message
- Confirmation number

### Patient Information Section
- Name
- Email (from booking form)
- Phone number

### Appointment Details Section
- Clinic name
- Clinic address
- Appointment date (formatted)
- Appointment time
- Service type
- Status badge

### Important Information
- Arrive 10-15 minutes early
- Bring valid ID and insurance card
- Reschedule 24 hours in advance
- Emergency contact information

### Contact Information
- Clinic phone number
- Clinic email

### Footer
- Link to view appointments
- Disclaimer about automated email
- Copyright information

## Testing

### Test the Email Service

1. **Update test email in script:**
   ```bash
   # Edit test-resend-email.js
   # Change: const testEmail = 'test@example.com';
   # To your actual test email
   ```

2. **Run the test:**
   ```bash
   node test-resend-email.js
   ```

3. **Check Resend Dashboard:**
   - Go to https://resend.com/emails
   - Verify email appears with correct recipient
   - Check email content and status

### Test with Booking Form

1. Go to http://localhost:5174/book/1
2. Fill in the booking form with your test email
3. Submit the appointment
4. Check your email inbox for confirmation
5. Verify email contains:
   - Your email address (from form)
   - Correct clinic name
   - Correct appointment date/time
   - Confirmation number

## Error Handling

### If Email Fails to Send

The system handles failures gracefully:

1. **Logs the error** with details
2. **Does NOT block appointment creation** - appointment is still saved
3. **Falls back to Gmail** if Resend fails
4. **Logs retry information** for manual follow-up

### Common Issues

**Issue:** "Invalid patient email"
- **Solution:** Verify email format in booking form (must include @)

**Issue:** "RESEND_API_KEY is not set"
- **Solution:** Add RESEND_API_KEY to .env file

**Issue:** "Email send failed"
- **Solution:** Check Resend dashboard for API errors
- Verify API key is valid
- Check email format

**Issue:** "Email not received"
- **Solution:** Check spam/junk folder
- Verify recipient email in Resend dashboard
- Check email logs in backend console

## Monitoring

### Backend Logs

The system logs all email activities:

```
✅ Appointment confirmation email sent successfully to patient@example.com
   Confirmation Number: APT-12345-6789
   Resend Message ID: msg_xxxxxxxxxxxx
```

### Resend Dashboard

Monitor emails at https://resend.com/emails:
- View all sent emails
- Check delivery status
- See open/click tracking
- View email content

## Production Considerations

### Domain Configuration
For production, configure a custom domain in Resend:
1. Add your domain to Resend
2. Update DNS records
3. Use custom domain in RESEND_FROM_EMAIL

### Email Templates
Consider creating reusable email templates in Resend for:
- Appointment confirmations
- Cancellations
- Reminders
- Rescheduling

### Rate Limiting
Resend has rate limits:
- Free tier: 100 emails/day
- Paid tier: Higher limits
- Monitor usage in dashboard

### Compliance
Ensure compliance with:
- GDPR (email consent)
- CAN-SPAM (unsubscribe links)
- HIPAA (if handling health data)

## Troubleshooting

### Debug Mode

Enable detailed logging by checking backend console:

```bash
# Watch for these logs:
✅ Appointment confirmation email sent successfully
❌ Failed to send appointment confirmation email
⚠️ Resend email failed (appointment still created)
```

### Check Email Headers

In Resend dashboard, view email headers to verify:
- From address
- To address
- Subject line
- Timestamp
- Message ID

### Test Different Scenarios

1. **Valid email:** Should send successfully
2. **Invalid email format:** Should log error but not crash
3. **Network error:** Should log error and continue
4. **API key invalid:** Should log error with details

## Support

For issues with Resend:
- Visit https://resend.com/docs
- Check Resend status page
- Contact Resend support

For issues with this implementation:
- Check backend logs
- Verify .env configuration
- Run test-resend-email.js
- Review error messages in console

## Files Modified

- `.env` - Added RESEND_API_KEY and RESEND_FROM_EMAIL
- `routes/appointments.js` - Added Resend email call
- `utils/resendEmailService.js` - New email service file
- `test-resend-email.js` - Test script

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to .env file
3. ✅ Run test-resend-email.js
4. ✅ Test with booking form
5. ✅ Monitor Resend dashboard
6. ✅ Configure for production
