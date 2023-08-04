import { Injectable } from '@nestjs/common';
import { WorkspaceRepository } from 'src/workspace/workspace.repository';
import { UserRepository } from 'src/auth/user.repository';

@Injectable()
export class BoardAclService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly userRepository: UserRepository,
  ) {}
}
