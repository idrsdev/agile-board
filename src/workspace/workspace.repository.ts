import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspaceRepository {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  async save(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.save(workspace);
  }

  async findOne(
    options: FindOneOptions<Workspace>,
  ): Promise<Workspace | undefined> {
    return this.workspaceRepository.findOne(options);
  }

  async findAndCount(
    options: FindManyOptions<Workspace>,
  ): Promise<[Workspace[], number]> {
    return this.workspaceRepository.findAndCount(options);
  }

  async delete(id: number): Promise<DeleteResult> {
    const result = await this.workspaceRepository.delete(id);
    return result;
  }

  async findWorkspacesCreatedByUser(
    userId: string,
    skip = 1,
    limit = 10,
  ): Promise<[Workspace[], number]> {
    const queryBuilder = this.workspaceRepository
      .createQueryBuilder('workspace')
      .where('workspace.createdBy = :userId', { userId })
      .orderBy('workspace.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [workspaces, total] = await queryBuilder.getManyAndCount();

    return [workspaces, total];
  }

  async findWorkspacesWhereMember(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<[Workspace[], number]> {
    const queryBuilder = this.workspaceRepository
      .createQueryBuilder('workspace')
      .leftJoin('workspace.members', 'member')
      .where('member.id = :userId', { userId })
      .orderBy('workspace.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [workspaces, total] = await queryBuilder.getManyAndCount();

    return [workspaces, total];
  }

  // TODO: Used this in service?
  async addMemberToWorkspace(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.save(workspace);
  }

  // TODO: Used this in service?
  async removeMemberFromWorkspace(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.save(workspace);
  }
}
