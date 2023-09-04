import { User } from '../../src/auth/user.entity';
import { CreateUserDto } from '../../src/auth/dto/createUser.dto';
import { TokenRepository } from '../../src/auth/token/token.repository';
import { UserRepository } from '../../src/auth/user.repository';

export async function createUserAndToken(
  userRepository: UserRepository, // Pass your user repository
  tokenRepository: TokenRepository, // Pass your token repository
  createUserDto: CreateUserDto, // Data for creating the user
): Promise<{ user: User; token: string }> {
  const user = await userRepository.createUser(createUserDto);
  const activationToken = await tokenRepository.generateActivationToken(
    user.id,
  );

  return { token: activationToken, user };
}
