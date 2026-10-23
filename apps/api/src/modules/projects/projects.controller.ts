import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  type AdminProject,
  type AdminProjectQuery,
  adminProjectQuerySchema,
  type AdminProjectRow,
  type Paginated,
  type ProjectDetail,
  type ProjectDuplicate,
  type ProjectDuplicateQuery,
  projectDuplicateQuerySchema,
  type ProjectInput,
  projectInputSchema,
  type ProjectLocality,
  type ProjectQuery,
  projectQuerySchema,
  type ProjectStats,
  type ProjectSummary,
  type ProjectUpdate,
  projectUpdateSchema,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { ProjectsService } from './projects.service.js';

const localitiesQuerySchema = projectQuerySchema.pick({ area: true });

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Query(new ZodPipe(projectQuerySchema)) query: ProjectQuery): Promise<Paginated<ProjectSummary>> {
    return this.projects.list(query);
  }

  /** "Popular localities" beside the listing. Declared before ':slug'. */
  @Get('localities')
  localities(@Query(new ZodPipe(localitiesQuerySchema)) query: Pick<ProjectQuery, 'area'>): Promise<ProjectLocality[]> {
    return this.projects.localities(query.area);
  }

  @Get(':slug')
  get(@Param('slug') slug: string): Promise<ProjectDetail> {
    return this.projects.getBySlug(slug);
  }
}

@Controller('admin/projects')
@UseGuards(AdminGuard)
export class AdminProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Query(new ZodPipe(adminProjectQuerySchema)) query: AdminProjectQuery): Promise<Paginated<AdminProjectRow>> {
    return this.projects.listAdmin(query);
  }

  // Fixed paths before ':id'.
  @Get('stats')
  stats(): Promise<ProjectStats> {
    return this.projects.stats();
  }

  /** The form's "Already listed" warning, checked while the name is typed. */
  @Get('duplicate')
  async duplicate(@Query(new ZodPipe(projectDuplicateQuerySchema)) query: ProjectDuplicateQuery): Promise<{ duplicate: ProjectDuplicate | null }> {
    // Wrapped: a bare null would reach the browser as an empty body.
    return { duplicate: await this.projects.findDuplicate(query.name, query.area, query.exclude) };
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<AdminProject> {
    return this.projects.getAdmin(id);
  }

  @Post()
  create(@Body(new ZodPipe(projectInputSchema)) body: ProjectInput): Promise<AdminProject> {
    return this.projects.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body(new ZodPipe(projectUpdateSchema)) body: ProjectUpdate): Promise<AdminProject> {
    return this.projects.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.projects.remove(id);
  }
}
