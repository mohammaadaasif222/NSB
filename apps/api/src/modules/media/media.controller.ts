import { Body, Controller, HttpCode, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  type StorageTestInput,
  storageTestSchema,
  type StorageTestResult,
  type UploadDiscardInput,
  uploadDiscardSchema,
  type UploadedImage,
  type UploadQuery,
  uploadQuerySchema,
} from '@nsb/shared';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard, Allow } from '../auth/admin.guard.js';
import { MediaService, type UploadedFile as File } from './media.service.js';

@Controller('admin/uploads')
@UseGuards(AdminGuard)
export class AdminUploadsController {
  constructor(private readonly media: MediaService) {}

  /**
   * multipart/form-data with one `file` field. Returns the URL to save on the banner,
   * category or listing. The guard runs before the body is read, so anonymous uploads never reach disk.
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Query(new ZodPipe(uploadQuerySchema)) query: UploadQuery,
    @UploadedFile() file: File | undefined,
  ): Promise<UploadedImage> {
    return this.media.upload(file, query.slot);
  }

  /** Deletes uploads that no record uses, e.g. when a form is cancelled. Always 204. */
  @Post('discard')
  @HttpCode(204)
  discard(@Body(new ZodPipe(uploadDiscardSchema)) body: UploadDiscardInput): Promise<void> {
    return this.media.release(body.urls);
  }

  /** Checks a storage provider's credentials by uploading and deleting a tiny image. */
  @Post('test')
  @HttpCode(200)
  @Allow('manage')
  test(@Body(new ZodPipe(storageTestSchema)) body: StorageTestInput): Promise<StorageTestResult> {
    return this.media.testStorage(body.provider);
  }
}
