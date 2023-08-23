import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RoleRepository } from './role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleRepository],
  exports: [RoleRepository, TypeOrmModule],
})
export class RoleModule {}
