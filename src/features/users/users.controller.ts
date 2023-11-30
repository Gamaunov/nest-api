import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Paginator } from '../../shared/genericTypes/paginator';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';

import { UsersService } from './users.service';
import { UserQuery } from './dto/user.query';
import { UsersQueryRepository } from './users.query.repository';
import { UserInputDTO } from './dto/user-input-dto';
import { UserView } from './schemas/user.view';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}
  @Get()
  async findUsers(@Query() query: UserQuery): Promise<Paginator<UserView[]>> {
    return this.usersQueryRepository.findUsers(query);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() userInputDTO: UserInputDTO): Promise<UserView> {
    return this.usersService.createUser(userInputDTO);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUserById(id);
  }

  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(204)
  async deleteAllUsers(): Promise<boolean> {
    return this.usersService.deleteAllUsers();
  }
}
