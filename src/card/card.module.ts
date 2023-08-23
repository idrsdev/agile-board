import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { Card } from './card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListModule } from 'src/list/list.module';
import { CardAssignment } from './card-assignment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserRepository } from 'src/auth/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, CardAssignment]),
    ListModule,
    AuthModule,
  ],
  controllers: [CardController],
  providers: [CardService, UserRepository],
})
export class CardModule {}
