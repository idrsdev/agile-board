import { SetMetadata } from '@nestjs/common';
import { UserRole } from './role.enum';

export const Roles = (...roles: UserRole[]): any => SetMetadata('roles', roles);
