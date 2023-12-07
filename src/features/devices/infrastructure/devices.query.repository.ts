import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Device, DeviceModelType } from '../device.entity';
import { DeviceViewDTO } from '../dto/device.view.dto';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}
  async findDevices(userId: string): Promise<DeviceViewDTO[]> {
    const devices = await this.DeviceModel.find({ userId }).lean();
    return devices.map((device) => {
      return {
        ip: device.ip,
        title: device.title,
        lastActiveDate: new Date(device.lastActiveDate * 1000).toISOString(),
        deviceId: device.deviceId,
      };
    });
  }
}
