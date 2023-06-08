import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async createToken(userId: number, token: string): Promise<Token> {
    const activationToken = this.tokenRepository.create({
      userId,
      token,
    });

    return this.tokenRepository.save(activationToken);
  }

  async findTokenByUserId(userId: number): Promise<Token | undefined> {
    return this.tokenRepository.findOne({ where: { userId } });
  }

  async deleteToken(token: Token): Promise<void> {
    await this.tokenRepository.remove(token);
  }

  async generateActivationToken(userId: number): Promise<string> {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    //@Note: A User can have maximum one token
    const isTokenExistsAginstThisUser = await this.findTokenByUserId(userId);
    if (isTokenExistsAginstThisUser)
      await this.tokenRepository.remove(isTokenExistsAginstThisUser);

    let token = '';
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }

    await this.createToken(userId, token);
    return token;
  }

  async validateActivationToken(
    userId: number,
    token: string,
  ): Promise<boolean> {
    const foundToken = await this.findTokenByUserId(userId);
    return !!foundToken && foundToken.token === token;
  }
}
