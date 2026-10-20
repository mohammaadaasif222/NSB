import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  type AdminCategory,
  type Category,
  type CategoryDetail,
  type CategoryInput,
  categoryInputSchema,
  type CategoryOrderInput,
  categoryOrderSchema,
  type CategoryQuery,
  categoryQuerySchema,
  type CategoryUpdate,
  categoryUpdateSchema,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  /** Top-level categories, or ?parent=<slug> for its sub-categories. */
  @Get()
  list(@Query(new ZodPipe(categoryQuerySchema)) query: CategoryQuery): Promise<Category[]> {
    return this.categories.list(query.parent);
  }

  @Get(':slug')
  get(@Param('slug') slug: string): Promise<CategoryDetail> {
    return this.categories.getBySlug(slug);
  }
}

@Controller('admin/categories')
@UseGuards(AdminGuard)
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(): Promise<AdminCategory[]> {
    return this.categories.listAll();
  }

  @Post()
  create(@Body(new ZodPipe(categoryInputSchema)) body: CategoryInput): Promise<Category> {
    return this.categories.create(body);
  }

  // Declared before ':id' so "order" isn't parsed as an id.
  @Put('order')
  reorder(@Body(new ZodPipe(categoryOrderSchema)) body: CategoryOrderInput): Promise<AdminCategory[]> {
    return this.categories.reorder(body.ids);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodPipe(categoryUpdateSchema)) body: CategoryUpdate,
  ): Promise<Category> {
    return this.categories.update(id, body);
  }

  /** Only empty categories: no sub-categories and no listings. */
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categories.remove(id);
  }
}
