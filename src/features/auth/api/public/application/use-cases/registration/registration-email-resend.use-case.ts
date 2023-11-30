import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { EmailInputDTO } from '../../../../../dto/email-input.dto';
import { UsersRepository } from '../../../../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../../../../users/user.entity';
import { SendRegistrationMailCommand } from '../../../../../../mail/application/use-cases/send-registration-mail.use-case';

export class RegistrationEmailResendCommand {
  constructor(public emailInputDTO: EmailInputDTO) {}
}

@CommandHandler(RegistrationEmailResendCommand)
export class RegistrationEmailResendUseCase
  implements ICommandHandler<RegistrationEmailResendCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(
    command: RegistrationEmailResendCommand,
  ): Promise<UserDocument | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.emailInputDTO.email,
    );

    if (!user || user.emailConfirmation.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();

    await user.updateEmailConfirmationData(newConfirmationCode);
    const result = await this.usersRepository.save(user);

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          user.accountData.login,
          user.accountData.email,
          newConfirmationCode,
        ),
      );
    } catch (error) {
      console.error(error);
      return null;
    }

    return result;
  }
}