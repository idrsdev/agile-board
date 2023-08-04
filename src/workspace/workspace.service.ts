import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Workspace } from './workspace.entity';
import { WorkspaceRepository } from './workspace.repository';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { AuthService } from 'src/auth/auth.service';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  In,
  Repository,
} from 'typeorm';
import { PaginatedResponse } from 'src/common/paginated-response.interface';
import { UserWorkspace } from './user-workspace.entity';
import { User } from 'src/auth/user.entity';
import { UserRole } from 'src/auth/roles/role.enum';
import { WorkspaceRole } from './workspace-role.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly userService: AuthService,
  ) {}

  /**
   * Get a paginated list of workspaces.
   *
   * @param userId - The ID of the user making the request.
   * @param page - The page number.
   * @param limit - The number of workspaces per page.
   * @returns A paginated list of workspaces.
   */
  async getAllWorkspaces(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedWorkspaces> {
    const userRoles = await this.userService.getUserRoles(userId);

    let workspaces: Workspace[];

    if (userRoles.includes(UserRole.ADMIN)) {
      workspaces = await this.workspaceRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      });
    } else {
      workspaces = await this.findWorkspacesByUserId(userId, page, limit);
    }

    const totalCount = await this.workspaceRepository.count();
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return {
      data: workspaces,
      hasMore,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Create a new workspace.
   *
   * @param {CreateWorkspaceDto} createWorkspaceDto - The data to create the workspace.
   * @param {number} userId - The ID of the user making the request.
   * @returns The created workspace.
   */
  async createWorkspace(
    createWorkspaceDto: CreateWorkspaceDto,
    userId: number,
  ) {
    const { name, description } = createWorkspaceDto;

    const workspace = new Workspace();
    workspace.name = name;
    workspace.description = description;

    const userWorkspace = new UserWorkspace();
    userWorkspace.user = await this.userService.getUserById(userId);
    userWorkspace.role = WorkspaceRole.OWNER;

    const createdWorkspace = await this.workspaceRepository.save(workspace);

    userWorkspace.workspace = createdWorkspace;
    await this.userWorkspaceRepository.save(userWorkspace);
    return createdWorkspace;
  }

  /**
   * Get a workspace by ID along with its members and owner.
   *
   * @param id - The ID of the workspace.
   * @param userId - The ID of the user making the request.
   * @returns The workspace details.
   */
  async getWorkspaceByIdAndUserId(
    id: number,
    userId: number,
  ): Promise<{
    members: User[];
    owner: User | undefined;
    workspace: Workspace;
  }> {
    const options: FindOneOptions<Workspace> = {
      where: {
        id: id,
        userWorkspaces: [
          // The user have to be a member irrespective of role
          { user: { id: userId } },
          // { user: { id: userId }, role: WorkspaceRole.MEMBER },
          // { user: { id: userId }, role: WorkspaceRole.ADMIN },
          // { user: { id: userId }, role: WorkspaceRole.OWNER },
        ],
      },
      relations: ['userWorkspaces', 'userWorkspaces.user', 'boards'],
    };
    const workspace = await this.workspaceRepository.findOne(options);

    if (!workspace) {
      throw new NotFoundException(
        'Workspace not found or you do not have permission to access it',
      );
    }

    const members = workspace.userWorkspaces
      .filter((userWorkspace) => userWorkspace.role !== 'owner')
      .map((userWorkspace) => {
        return { ...userWorkspace.user, role: userWorkspace.role };
      });

    const userWorkspaces = workspace.userWorkspaces.find(
      (userWorkspace) => userWorkspace.role === 'owner',
    );

    const owner = {
      ...userWorkspaces?.user,
      role: userWorkspaces?.role,
    };

    return { workspace, members, owner };
  }

  /**
   * Update a workspace.
   *
   * @param workspaceId - The ID of the workspace to update.
   * @param updateWorkspaceDto - The data to update the workspace.
   * @param userId - The ID of the user making the request.
   * @returns The updated workspace.
   */
  async updateWorkspace(
    workspaceId: number,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: number,
  ): Promise<Workspace> {
    const ownerUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: {
          id: workspaceId,
        },
        user: {
          id: userId,
        },
      },
      relations: {
        workspace: true,
      },
    });

    if (!ownerUserWorkspace || ownerUserWorkspace.role !== 'owner') {
      throw new UnauthorizedException(
        'Only the owner can delete the workspace',
      );
    }

    const { name } = updateWorkspaceDto;
    ownerUserWorkspace.workspace.name = name;

    await this.workspaceRepository.save(ownerUserWorkspace.workspace);

    return ownerUserWorkspace.workspace;
  }

  /**
   * Delete a workspace.
   *
   * @param workspaceId - The ID of the workspace to delete.
   * @param userId - The ID of the user making the request.
   */
  async deleteWorkspace(workspaceId: number, userId: number): Promise<void> {
    const ownerUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: {
          id: workspaceId,
        },
        user: {
          id: userId,
        },
      },
    });

    if (!ownerUserWorkspace) {
      throw new BadRequestException('Workspace not found');
    }

    if (ownerUserWorkspace.role !== 'owner') {
      throw new UnauthorizedException(
        'Only the owner can delete the workspace',
      );
    }

    const result: DeleteResult = await this.workspaceRepository.delete(
      workspaceId,
    );

    if (result.affected === 0) {
      throw new NotFoundException('Workspace not found');
    }
  }

  /**
   * Get the list of members in a workspace.
   *
   * @param {number} workspaceId - The ID of the workspace.
   * @returns {Promise<
   *   { id: number; role: WorkspaceRole; name: string; email: string }[]
   * >} The list of workspace members.
   */
  async getWorkspaceMembers(
    workspaceId: number,
  ): Promise<
    { id: number; role: WorkspaceRole; name: string; email: string }[]
  > {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
      relations: {
        userWorkspaces: {
          user: true,
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace.userWorkspaces.map((userWorkspace) => ({
      id: userWorkspace.user.id,
      role: userWorkspace.role,
      name: userWorkspace.user.name,
      email: userWorkspace.user.email,
    }));
  }

  /**
   * Add a member to a workspace.
   *
   * @param workspaceId - The ID of the workspace.
   * @param memberId - The ID of the user to add as a member.
   * @param userId - The ID of the user making the request.
   * @param role - The role of the member being added (default: 'member).
   * @returns The updated workspace.
   */
  async addMemberToWorkspace(
    workspaceId: number,
    memberId: number,
    userId: number,
    role: WorkspaceRole = WorkspaceRole.MEMBER,
  ): Promise<{ memberId: number; message: string }> {
    if (!(await this.checkUserIsOwnerOrAdmin(workspaceId, userId))) {
      throw new UnauthorizedException(
        'Only the owner or admin can perform this action',
      );
    }

    const memberUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: {
          id: workspaceId,
        },
        user: {
          id: memberId,
        },
      },
    });

    if (!memberUserWorkspace) {
      await this.createMemberUserWorkspace(workspaceId, memberId, role);
      return { memberId, message: 'Member Add Succesfully' };
    }

    return { memberId, message: 'Member Already Added' };
  }

  /**
   * Remove a member from a workspace.
   *
   * @param workspaceId - The ID of the workspace.
   * @param memberId - The ID of the member to remove.
   * @param userId - The ID of the user making the request.
   * @returns The updated workspace.
   */
  async removeMemberFromWorkspace(
    workspaceId: number,
    memberId: number,
    userId: number,
  ): Promise<void> {
    if (!(await this.checkUserIsOwnerOrAdmin(workspaceId, userId))) {
      throw new UnauthorizedException(
        'Only the owner or admin can perform this action',
      );
    }

    const memberUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: memberId },
      },
    });

    if (!memberUserWorkspace) {
      throw new NotFoundException('Member not found in this workspace');
    }

    if (memberUserWorkspace.role === 'owner') {
      throw new UnauthorizedException('Cannot remove the owner');
    }

    await this.userWorkspaceRepository.remove(memberUserWorkspace);
  }

  /**
   * Get a paginated list of workspaces created by the user.
   *
   * @param userId - The ID of the user.
   * @param page - The page number.
   * @param limit - The number of workspaces per page.
   * @returns A paginated list of workspaces created by the user.
   */
  async getWorkspacesCreatedByUser(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedWorkspaces> {
    const options: FindManyOptions<UserWorkspace> = {
      where: {
        user: { id: userId },
        role: In(['owner']),
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        workspace: true,
      },
    };

    const [userWorkspaces, count] =
      await this.userWorkspaceRepository.findAndCount(options);

    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;

    return {
      data: userWorkspaces.map((x) => x.workspace),
      hasMore,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Get a paginated list of workspaces where the user is a member or admin.
   *
   * @param userId - The ID of the user.
   * @param page - The page number.
   * @param limit - The number of workspaces per page.
   * @returns A paginated list of workspaces where the user is a member or admin.
   */
  async getWorkspacesWhereMember(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedWorkspaces> {
    const options: FindManyOptions<UserWorkspace> = {
      where: {
        user: { id: userId },
        role: In(['member', 'admin']),
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['workspace'],
    };

    const [userWorkspaces, count] =
      await this.userWorkspaceRepository.findAndCount(options);

    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;

    return {
      data: userWorkspaces.map((x) => x.workspace),
      hasMore,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Get a paginated list of workspaces associated with a user.
   *
   * @param userId - The ID of the user.
   * @param page - The page number.
   * @param limit - The number of workspaces per page.
   * @returns A paginated list of workspaces associated with the user.
   */
  async findWorkspacesByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<Workspace[]> {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['workspace'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return userWorkspaces.map((userWorkspace) => userWorkspace.workspace);
  }

  /**
   * Check if the user is the owner of the workspace.
   *
   * @param workspaceId - The ID of the workspace.
   * @param userId - The ID of the user to check.
   */
  private async checkUserIsOwner(
    workspaceId: number,
    userId: number,
  ): Promise<void> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
      },
    });

    if (!userWorkspace || userWorkspace.role !== 'owner') {
      throw new UnauthorizedException('Only the owner can perform this action');
    }
  }

  /**
   * Check if the user is the owner or an admin of the workspace.
   *
   * @param workspaceId - The ID of the workspace.
   * @param userId - The user to check.
   * @returns True if the user is authorized (owner or admin), otherwise False.
   */
  public async checkUserIsOwnerOrAdmin(
    workspaceId: number,
    userId: number,
  ): Promise<boolean> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
      },
    });

    if (
      !userWorkspace ||
      ![WorkspaceRole.OWNER, WorkspaceRole.ADMIN].includes(userWorkspace.role)
    ) {
      return false;
    }

    return true;
  }

  /* Create a member user workspace and save it.
   *
   * @param workspaceId - The ID of the workspace.
   * @param memberId - The ID of the user to add as a member.
   */
  private async createMemberUserWorkspace(
    workspaceId: number,
    memberId: number,
    role: WorkspaceRole,
  ): Promise<void> {
    const newMemberUserWorkspace = new UserWorkspace();
    newMemberUserWorkspace.user = await this.userService.getUserById(memberId);
    newMemberUserWorkspace.workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    newMemberUserWorkspace.role = role;
    await this.userWorkspaceRepository.save(newMemberUserWorkspace);
  }

  /**
   * Check if the user is a member of the specified workspace.
   *
   * @param {number} workspaceId - The ID of the workspace.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<boolean>} - Returns `true` if the user is a member of the workspace, `false` otherwise.
   */
  async checkUserIsMemberOfWorkspace(
    workspaceId: number,
    userId: number,
  ): Promise<boolean> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: {
          id: workspaceId,
        },
        user: {
          id: userId,
        },
      },
    });

    return !!userWorkspace;
  }

  /**
   * Get the role of the user in the specified workspace.
   *
   * @param {number} workspaceId - The ID of the workspace.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<WorkspaceRole | null>} - Returns the role of the user in the workspace, or `null` if the user is not a member.
   */
  async getUserWorkspaceRole(
    workspaceId: number,
    userId: number,
  ): Promise<WorkspaceRole | null> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: userId },
      },
    });

    return userWorkspace ? userWorkspace.role : null;
  }
}

export type PaginatedWorkspaces = PaginatedResponse<Workspace>;
// @EXAMPLE How to use query Builder
// const queryBuilder =
//   this.workspaceRepository.createQueryBuilder('workspace');
// const [workspaces, count] = await queryBuilder
//   .leftJoin('workspace.members', 'member')
//   .where('member.id = :userId', { userId })
//   .skip(skip)
//   .take(limit)
//   .getManyAndCount();
