import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Workspace } from './workspace.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginatedWorkspaces, WorkspaceService } from './workspace.service';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AddOrRemoveMemberDto } from './dto/add-or-remove-member.dto';
import { PaginationParamsDTO } from 'src/common/pagination-params.dto';
import { UserRole } from 'src/auth/roles/role.enum';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RoleGuard } from 'src/auth/roles/role.guard';
import { User } from 'src/auth/user.entity';

@ApiTags('Workspaces')
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all workspaces',
    type: Workspace,
    isArray: true,
  })
  getAllWorkspace(
    @GetUserId() userId: number,
    @Query() query: PaginationParamsDTO,
  ): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getAllWorkspaces(
      userId,
      query.page,
      query.limit,
    );
  }

  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Returns all workspaces Created By Current User',
    type: Workspace,
    isArray: true,
  })
  getMyWorkspace(
    @GetUserId() userId: number,
    @Query() query: PaginationParamsDTO,
  ): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getWorkspacesCreatedByUser(
      userId,
      query.page,
      query.limit,
    );
  }

  @Get('member')
  @ApiResponse({
    status: 200,
    description: 'Returns all workspaces where Current User is a member',
    type: Workspace,
    isArray: true,
  })
  getWorkspaceWhereIAmMember(
    @GetUserId() userId: number,
    @Query() query: PaginationParamsDTO,
  ): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getWorkspacesWhereMember(
      userId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returns a single workspace if author or member',
    type: Workspace,
  })
  getWorkspaceById(
    @Param('id') id: number,
    @GetUserId() userId: number,
  ): Promise<{
    members: User[];
    owner: User | undefined;
    workspace: Workspace;
  }> {
    return this.workspaceService.getWorkspaceByIdAndUserId(id, userId);
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Creates a new workspace',
    type: Workspace,
  })
  createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @GetUserId() userId: number,
  ): Promise<Workspace> {
    return this.workspaceService.createWorkspace(createWorkspaceDto, userId);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Deletes a workspace if author' })
  deleteWorkspace(
    @Param('id') id: number,
    @GetUserId() userId: number,
  ): Promise<void> {
    return this.workspaceService.deleteWorkspace(id, userId);
  }

  @ApiResponse({
    status: 200,
    description: 'Get a list of workspace member',
    type: Workspace,
  })
  @Get(':workspaceId/members')
  async getWorkspaceMembers(@Param('workspaceId') workspaceId: number) {
    return this.workspaceService.getWorkspaceMembers(workspaceId);
  }

  @ApiResponse({
    status: 200,
    description: 'Add a member to workspace if author',
    type: Workspace,
  })
  @Patch('add-member')
  addMemberToWorkspace(
    @Body() addMemberToWorkspaceDto: AddOrRemoveMemberDto,
    @GetUserId() userId: number,
  ): Promise<{ memberId: number; message: string }> {
    return this.workspaceService.addMemberToWorkspace(
      addMemberToWorkspaceDto.workspaceId,
      addMemberToWorkspaceDto.memberId,
      userId,
    );
  }

  @Patch('remove-member')
  @ApiResponse({
    status: 200,
    description: 'Remove a member from workspace if removed by author',
    type: Workspace,
  })
  removeMemberFromWorkspace(
    @Body() removeMemberToWorkspaceDto: AddOrRemoveMemberDto,
    @GetUserId() userId: number,
  ): Promise<void> {
    return this.workspaceService.removeMemberFromWorkspace(
      removeMemberToWorkspaceDto.workspaceId,
      removeMemberToWorkspaceDto.memberId,
      userId,
    );
  }
  // @NOTE: This URL will be at the end
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Updates an existing workspace if author',
    type: Workspace,
  })
  updateWorkspace(
    @Param('id') id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @GetUserId() userId: number,
  ): Promise<Workspace> {
    return this.workspaceService.updateWorkspace(
      id,
      updateWorkspaceDto,
      userId,
    );
  }
}
