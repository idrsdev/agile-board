import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../user.entity';
import { UserRole } from './role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No role requirement, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user || !user.roles) {
      return false; // User or roles not found, deny access
    }

    const userRoles = user.roles.map((role) => role.name);
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    return hasRequiredRole;
  }
}
