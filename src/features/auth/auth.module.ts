import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';

import { User, UserSchema } from '../users/domain/user.entity';
import { DeviceCreateForLoginUseCase } from '../devices/api/public/application/use-cases/device-create-for-login.use-case';
import { DeviceUpdateForTokensUseCase } from '../devices/api/public/application/use-cases/device-update-for-tokens.use-case';
import { DeviceDeleteForLogoutUseCase } from '../devices/api/public/application/use-cases/device-delete-for-logout.use-case';
import { DevicesRepository } from '../devices/infrastructure/devices.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { Device, DeviceSchema } from '../devices/domain/device.entity';
import { CheckLoginAndEmailMiddleware } from '../../infrastructure/middlewares/check-login-and-email.middleware';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { RegistrationUseCase } from './api/public/application/use-cases/registration/registration.use-case';
import { RegistrationEmailResendUseCase } from './api/public/application/use-cases/registration/registration-email-resend.use-case';
import { RegistrationConfirmationUseCase } from './api/public/application/use-cases/registration/registration-confirmation.use-case';
import { PasswordRecoveryUseCase } from './api/public/application/use-cases/password/password-recovery.use-case';
import { PasswordUpdateUseCase } from './api/public/application/use-cases/password/password-update.use-case';
import { ValidateLoginAndPasswordUseCase } from './api/public/application/use-cases/validations/validate-login-pass.use-case';
import { ValidateRefreshTokenUseCase } from './api/public/application/use-cases/validations/validate-refresh-token.use-case';
import { TokensCreateUseCase } from './api/public/application/use-cases/tokens/tokens-create.use-case';
import { PublicAuthController } from './api/public/public.auth.controller';
import { AuthService } from './api/public/application/use-cases/auth.service';

const services = [JwtService, AuthService];

const useCases = [
  RegistrationUseCase,
  RegistrationEmailResendUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  PasswordUpdateUseCase,
  ValidateLoginAndPasswordUseCase,
  ValidateRefreshTokenUseCase,
  DeviceCreateForLoginUseCase,
  DeviceUpdateForTokensUseCase,
  DeviceDeleteForLogoutUseCase,
  TokensCreateUseCase,
];

const repositories = [DevicesRepository, UsersRepository];

const strategies = [
  BasicStrategy,
  JwtBearerStrategy,
  JwtRefreshTokenStrategy,
  LocalStrategy,
];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CqrsModule,
    PassportModule,
  ],
  controllers: [PublicAuthController],
  providers: [...services, ...useCases, ...repositories, ...strategies],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckLoginAndEmailMiddleware).forRoutes('auth/registration');
  }
}
