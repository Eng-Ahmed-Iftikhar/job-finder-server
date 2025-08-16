# SMS Service Setup Guide (Twilio Only)

This guide explains how to configure the SMS service for phone verification in your job-finder application using Twilio.

## Configuration

The SMS service uses Twilio for sending SMS messages. Configure it using environment variables.

### Environment Variables

```bash
# Twilio Configuration (Required)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Setup

### 1. Twilio Account Setup

1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number for sending SMS
4. Set the environment variables above

### 2. Install Twilio Package

```bash
npm install twilio
```

## Usage

The SMS service is automatically integrated with the auth service for phone verification:

```typescript
// In your auth service
async sendPhoneVerification(dto: SendPhoneVerificationDto) {
  const verificationCode = this.generateVerificationCode();

  // Send SMS with verification code
  const smsSent = await this.smsService.sendVerificationCode(
    dto.phone,
    verificationCode
  );

  if (!smsSent) {
    throw new BadRequestException('Failed to send verification code');
  }

  return { message: 'Verification code sent successfully' };
}
```

## Error Handling

The service gracefully handles various error scenarios:

- Missing Twilio credentials
- Invalid phone numbers
- Network failures
- Twilio API errors

## Testing

### Unit Tests

```bash
npm run test src/sms/sms.service.spec.ts
```

### Integration Tests

```bash
npm run test:e2e
```

## Production Considerations

1. **Phone Number Validation**: Ensure phone numbers are in E.164 format (+1234567890)
2. **Message Templates**: Customize SMS messages for different regions/languages
3. **Delivery Reports**: Monitor SMS delivery success rates using Twilio Console
4. **Cost Optimization**: Monitor your Twilio usage and costs
5. **Compliance**: Ensure compliance with local SMS regulations (TCPA, GDPR, etc.)

## Troubleshooting

### Common Issues

1. **SMS not sending**:
   - Check Twilio credentials in environment variables
   - Verify phone number format (must be E.164)
   - Check Twilio account status and balance
   - Review Twilio Console logs

2. **Authentication errors**:
   - Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
   - Check if credentials are correct
   - Ensure environment variables are loaded

3. **Phone number errors**:
   - Verify TWILIO_PHONE_NUMBER is set
   - Check if the number is active in Twilio
   - Ensure the number has SMS capabilities

### Logs

The service provides detailed logging:

- SMS send attempts
- Success/failure status
- Twilio SID for tracking
- Error details

## Security

- Never log sensitive SMS content in production
- Use environment variables for Twilio credentials
- Monitor Twilio usage for unusual patterns
- Regularly rotate Twilio auth tokens

## Twilio Console

Use the Twilio Console to:

- Monitor SMS delivery status
- View usage and costs
- Check phone number capabilities
- Access logs and analytics
