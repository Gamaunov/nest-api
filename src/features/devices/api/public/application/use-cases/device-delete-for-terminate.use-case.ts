import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DevicesRepository } from '../../../../infrastructure/devices.repository';
import { ExceptionResultType } from '../../../../../../infrastructure/types/exceptions.types';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  deviceIDField,
  deviceNotFound,
} from '../../../../../../base/constants/constants';

export class DeviceDeleteForTerminateCommand {
  constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(DeviceDeleteForTerminateCommand)
export class DeviceDeleteForTerminateUseCase
  implements ICommandHandler<DeviceDeleteForTerminateCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async execute(
    command: DeviceDeleteForTerminateCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const device = await this.devicesRepository.findDevice(command.deviceId);

    if (!device) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: deviceIDField,
        message: deviceNotFound,
      };
    }

    if (device.userId !== command.userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    await this.devicesRepository.deleteDevice(command.deviceId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
