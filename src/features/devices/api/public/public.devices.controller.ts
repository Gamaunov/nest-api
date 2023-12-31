import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DevicesQueryRepository } from '../../infrastructure/devices.query.repository';
import { JwtRefreshGuard } from '../../../auth/guards/jwt-refresh.guard';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { RefreshToken } from '../../../auth/decorators/refresh-token.param.decorator';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception.handler';

import { DeviceDeleteForTerminateCommand } from './application/use-cases/device-delete-for-terminate.use-case';
import { DevicesDeleteOldCommand } from './application/use-cases/devices-delete-old.use-case';

@ApiTags('security')
@Controller('security')
export class PublicDevicesController {
  constructor(
    private commandBus: CommandBus,
    private readonly devicesQueryRepository: DevicesQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  @Get('devices')
  @ApiOperation({
    summary: 'Returns all devices with active sessions for current user',
  })
  @UseGuards(JwtRefreshGuard)
  async getDevices(@UserIdFromGuard() userId: string) {
    return this.devicesQueryRepository.findDevices(userId);
  }

  @Delete('devices')
  @ApiOperation({
    summary: 'Terminate all other (exclude current) devices sessions',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async deleteOldDevices(@RefreshToken() refreshToken) {
    const decodedToken: any = this.jwtService.decode(refreshToken);
    const deviceId = decodedToken?.deviceId;
    return this.commandBus.execute(new DevicesDeleteOldCommand(deviceId));
  }

  @Delete('devices/:id')
  @ApiOperation({
    summary: 'Terminate specified device session',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async terminateSession(
    @Param('id') deviceId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeviceDeleteForTerminateCommand(deviceId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
