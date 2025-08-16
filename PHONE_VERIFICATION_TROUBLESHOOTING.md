# Phone Verification Troubleshooting Guide

If phone verification is not working, follow these steps to diagnose and fix the issue.

## Quick Checklist

- [ ] Twilio package installed: `npm install twilio`
- [ ] Environment variables set correctly
- [ ] Twilio account active and has balance
- [ ] Phone number has SMS capabilities
- [ ] Phone number format is E.164 (+1234567890)

## Environment Variables Check

Make sure these are set in your `.env` file:

```bash
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Common Issues & Solutions

### 1. "Twilio credentials not configured" Error

**Problem**: SMS service can't find Twilio credentials.

**Solution**:

- Check your `.env` file exists
- Verify variable names are exactly as shown above
- Restart your server after changing environment variables

### 2. "TWILIO_PHONE_NUMBER not configured" Error

**Problem**: The from phone number is missing.

**Solution**:

- Set `TWILIO_PHONE_NUMBER` in your `.env` file
- Use the exact format: `+1234567890`
- Ensure the number is active in your Twilio account

### 3. "Failed to send SMS verification code" Error

**Problem**: SMS service returned false.

**Possible Causes**:

- Invalid phone number format
- Twilio account suspended
- Insufficient balance
- Phone number not SMS-enabled

**Solutions**:

- Check phone number format (must be E.164)
- Verify Twilio account status
- Check Twilio balance
- Ensure phone number has SMS capabilities

### 4. Phone Number Format Issues

**Problem**: Phone numbers not in correct format.

**Solution**:

- Use E.164 format: `+[country code][number]`
- Examples: `+1234567890`, `+447911123456`
- Remove spaces, dashes, and parentheses

### 5. Twilio Account Issues

**Problem**: Twilio account problems.

**Solutions**:

- Check Twilio Console for account status
- Verify account is not suspended
- Ensure sufficient balance
- Check if trial account has expired

## Testing Steps

### 1. Test Environment Variables

```bash
# Check if variables are loaded
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_PHONE_NUMBER
```

### 2. Test Twilio Connection

```bash
# Install Twilio CLI for testing
npm install -g twilio-cli

# Test credentials
twilio api:core:accounts:list
```

### 3. Test SMS Sending

```bash
# Test with Twilio CLI
twilio api:core:messages:create \
  --from "+1234567890" \
  --to "+1234567890" \
  --body "Test message"
```

## Debug Logs

Check your server logs for these messages:

```
✅ Twilio client initialized successfully
✅ SMS sent successfully to +1234567890, SID: MG1234567890abcdef
❌ Twilio credentials not configured, SMS will not be sent
❌ TWILIO_PHONE_NUMBER not configured
❌ Twilio SMS error for +1234567890: [error details]
```

## Phone Verification Flow

1. **Request Verification**: User requests phone verification
2. **Generate Code**: 6-digit code generated
3. **Send SMS**: Code sent via Twilio
4. **Store Code**: Code stored in database with expiration
5. **User Enters Code**: User submits the code
6. **Verify Code**: Code validated against database
7. **Mark Verified**: Phone number marked as verified

## API Endpoints

- **Send Verification**: `POST /auth/send-phone-verification`
- **Verify Code**: `POST /auth/verify-phone-code`

## Request Format

```json
{
  "phone": "+1234567890"
}
```

## Response Format

```json
{
  "message": "Verification code sent successfully"
}
```

## Still Having Issues?

1. Check Twilio Console for detailed error logs
2. Verify your Twilio phone number is SMS-enabled
3. Test with a known working phone number
4. Check server logs for detailed error messages
5. Ensure your Twilio account is not in trial mode (if sending to unverified numbers)
