import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Workspace } from './workspace.entity';
import { WorkspaceRepository } from './workspace.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { AuthService } from 'src/auth/auth.service';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { DeleteResult, FindManyOptions, FindOneOptions } from 'typeorm';
import { PaginatedResponse } from 'src/common/interfaces';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly userService: AuthService,
  ) {}

  async getAllWorkspaces(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedWorkspaces> {
    // TODO: Implement this in user Service ?
    // const isAdmin = await this.userService.isAdminUser(userId);
    // if (!isAdmin) {
    //   throw new UnauthorizedException(
    //     'You are not authorized to access this endpoint',
    //   );
    // }
    const options: FindManyOptions<Workspace> = {
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, count] = await this.workspaceRepository.findAndCount(options);

    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;

    return {
      data,
      hasMore,
      totalPages,
      currentPage: page,
    };
  }

  async createWorkspace(
    createWorkspaceDto: CreateWorkspaceDto,
    createdBy: string,
  ) {
    const { name } = createWorkspaceDto;

    const workspace = new Workspace();
    workspace.name = name;
    workspace.createdBy = await this.userService.getUserById(createdBy);
    return this.workspaceRepository.save(workspace);
  }

  async getWorkspaceByUserIdWhereOwnerOrMember(
    id: number,
    userId: string,
  ): Promise<Workspace> {
    const options: FindOneOptions<Workspace> = {
      where: {
        id: id,
      },
      relations: ['createdBy', 'members'], // TODO: add 'boards' when implemented
    };
    const workspace = await this.workspaceRepository.findOne(options);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isAuthor = workspace.createdBy.id === userId;
    const isMember = workspace.members.some((member) => member.id === userId);

    if (isAuthor || isMember) {
      return workspace;
    }

    throw new UnauthorizedException(
      'You are not authorized to access this workspace',
    );
  }

  async updateWorkspace(
    id: number,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.getWorkspaceById(id);

    if (workspace.createdBy.id !== userId) {
      throw new UnauthorizedException(
        'Only the owner can update the workspace',
      );
    }

    const { name } = updateWorkspaceDto;
    workspace.name = name;

    return this.workspaceRepository.save(workspace);
  }

  async deleteWorkspace(id: number, userId: string): Promise<void> {
    const workspace = await this.getWorkspaceById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.createdBy.id !== userId) {
      throw new UnauthorizedException(
        'Only the owner can delete the workspace',
      );
    }

    const result: DeleteResult = await this.workspaceRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Workspace not found');
    }
  }

  async addMemberToWorkspace(
    workspaceId: number,
    memberId: string,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.getWorkspaceById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.createdBy.id !== userId) {
      throw new UnauthorizedException(
        'Only the owner can add members to the workspace',
      );
    }

    const member = await this.userService.getUserById(memberId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    // TODO: Fix this addition of member
    workspace.members.push(member);
    return this.workspaceRepository.save(workspace);
  }

  async removeMemberFromWorkspace(
    workspaceId: number,
    memberId: string,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.getWorkspaceById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.createdBy.id !== userId) {
      throw new UnauthorizedException(
        'Only the owner can remove members from the workspace',
      );
    }

    workspace.members = workspace.members.filter(
      (member) => member.id !== memberId,
    );

    return this.workspaceRepository.save(workspace);
  }

  async getWorkspacesCreatedByUser(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedWorkspaces> {
    const skip = (page - 1) * limit;

    const [data, count] =
      await this.workspaceRepository.findWorkspacesCreatedByUser(
        userId,
        skip,
        limit,
      );

    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;

    return {
      data,
      hasMore,
      totalPages,
      currentPage: page,
    };
  }

  async getWorkspacesWhereMember(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedWorkspaces> {
    const skip = (page - 1) * limit;

    const [data, count] =
      await this.workspaceRepository.findWorkspacesWhereMember(
        userId,
        skip,
        limit,
      );

    // const queryBuilder =
    //   this.workspaceRepository.createQueryBuilder('workspace');
    // const [workspaces, count] = await queryBuilder
    //   .leftJoin('workspace.members', 'member')
    //   .where('member.id = :userId', { userId })
    //   .skip(skip)
    //   .take(limit)
    //   .getManyAndCount();

    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;

    return {
      data,
      hasMore,
      totalPages,
      currentPage: page,
    };
  }

  private async getWorkspaceById(id: number): Promise<Workspace | null> {
    const options: FindOneOptions<Workspace> = {
      where: {
        id: id,
      },
      relations: ['createdBy'],
    };
    const workspace = await this.workspaceRepository.findOne(options);

    return workspace || null;
  }
}

export type PaginatedWorkspaces = PaginatedResponse<Workspace>;
