import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { EmailInputDTO } from '../../../../../dto/email-input.dto';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../../../users/user.entity';
import { SendPasswordRecoveryMailCommand } from '../../../../../../mail/application/use-cases/send-pass-recovery-mail.use-case';

export class PasswordRecoveryCommand {
  constructor(public emailInputDto: EmailInputDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: PasswordRecoveryCommand,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.emailInputDto.email,
    );

    if (!user) {
      return null;
    }

    const recoveryCode = randomUUID();

    await user.updatePasswordRecoveryData(recoveryCode);
    const result = await this.usersRepository.save(user);

    try {
      await this.commandBus.execute(
        new SendPasswordRecoveryMailCommand(
          user.accountData.login,
          user.accountData.email,
          recoveryCode,
        ),
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}
