import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';

describe('SmsService', () => {
  let service: SmsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should handle missing Twilio credentials gracefully', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const result = await service.sendSms('+1234567890', 'Test message');
      expect(result).toBe(false);
    });

    it('should handle missing phone number configuration', async () => {
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce('test_sid') // TWILIO_ACCOUNT_SID
        .mockReturnValueOnce('test_token') // TWILIO_AUTH_TOKEN
        .mockReturnValueOnce(undefined); // TWILIO_PHONE_NUMBER

      const result = await service.sendSms('+1234567890', 'Test message');
      expect(result).toBe(false);
    });
  });

  describe('sendVerificationCode', () => {
    it('should send verification code with proper message format', async () => {
      const sendSmsSpy = jest.spyOn(service, 'sendSms').mockResolvedValue(true);

      await service.sendVerificationCode('+1234567890', '123456');

      expect(sendSmsSpy).toHaveBeenCalledWith(
        '+1234567890',
        expect.stringContaining('123456'),
      );
    });
  });
});
