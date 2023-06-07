import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Workspace } from './workspace.entity';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginatedWorkspaces, WorkspaceService } from './workspace.service';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('Workspaces')
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // @ROLE_GUARD() // To check if the user has an admin role?
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns all workspaces',
    type: Workspace,
    isArray: true,
  })
  getAllWorkspace(@GetUserId() userId: string): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getAllWorkspaces(userId);
  }

  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Returns all workspaces Created By Current User',
    type: Workspace,
    isArray: true,
  })
  getMyWorkspace(@GetUserId() userId: string): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getWorkspacesCreatedByUser(userId);
  }

  @Get('member')
  @ApiResponse({
    status: 200,
    description: 'Returns all workspaces where Current User is a member',
    type: Workspace,
    isArray: true,
  })
  getWorkspaceWhereIAmMember(
    @GetUserId() userId: string,
  ): Promise<PaginatedWorkspaces> {
    return this.workspaceService.getWorkspacesWhereMember(userId);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Returns a single workspace if author or member',
    type: Workspace,
  })
  getWorkspaceById(
    @Param('id') id: number,
    @GetUserId() userId: string,
  ): Promise<Workspace> {
    return this.workspaceService.getWorkspaceByUserIdWhereOwnerOrMember(
      id,
      userId,
    );
  }

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Creates a new workspace',
    type: Workspace,
  })
  createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @GetUserId() userId: string,
  ): Promise<Workspace> {
    return this.workspaceService.createWorkspace(createWorkspaceDto, userId);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Updates an existing workspace if author',
    type: Workspace,
  })
  updateWorkspace(
    @Param('id') id: number,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @GetUserId() userId: string,
  ): Promise<Workspace> {
    return this.workspaceService.updateWorkspace(
      id,
      updateWorkspaceDto,
      userId,
    );
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Deletes a workspace if author' })
  deleteWorkspace(
    @Param('id') id: number,
    @GetUserId() userId: string,
  ): Promise<void> {
    return this.workspaceService.deleteWorkspace(id, userId);
  }

  @Patch(':id/add-member/:memberId')
  @ApiResponse({
    status: 200,
    description: 'Add a member to workspace if author',
    type: Workspace,
  })
  addMemberToWorkspace(
    @Param('id') workspaceId: number,
    @Param('memberId') memberId: string,
    @GetUserId() userId: string,
  ): Promise<Workspace> {
    return this.workspaceService.addMemberToWorkspace(
      workspaceId,
      memberId,
      userId,
    );
  }

  @Patch(':id/remove-member/:memberId')
  @ApiResponse({
    status: 200,
    description: 'Remove a member from workspace if author',
    type: Workspace,
  })
  removeMemberFromWorkspace(
    @Param('id') workspaceId: number,
    @Param('memberId') memberId: string,
    @GetUserId() userId: string,
  ): Promise<Workspace> {
    return this.workspaceService.removeMemberFromWorkspace(
      workspaceId,
      memberId,
      userId,
    );
  }
}
