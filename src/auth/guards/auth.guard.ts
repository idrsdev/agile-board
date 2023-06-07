import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

import { IS_PUBLIC_KEY } from '../decorators/IsPublic';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access to public routes without authentication
    }

    // Authentication logic
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }

    try {
      if (authHeader && authHeader.startsWith('Bearer')) {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET ? process.env.JWT_SECRET : '',
        );

        const user = await this.authService.getUserById(decoded._id);

        if (!user) {
          throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
        }

        req.user = user;
        return true;
      }
    } catch (error) {
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }

    return false;
  }
}
