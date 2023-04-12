import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import JwtAuthGuard from '../auth/guard/jwtAuth.guard';

// Service
import { ArticleService } from './article.service';

// DTO
import {
  CreateArticleDTO,
  GetListArticleDTO,
  SearchArticleDTO,
  UpdateArticleDTO,
} from './dto';

@Controller('article')
@ApiTags('Article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('search')
  @ApiQuery({ name: 'textSearch' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'perPage' })
  @ApiQuery({ name: 'sortByDate', enum: ['asc', 'desc'] })
  async searchArticle(@Query() query: SearchArticleDTO) {
    return this.articleService.searchForArticle(query);
  }

  @Get()
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'perPage' })
  @ApiQuery({ name: 'sortByDate', enum: ['asc', 'desc'] })
  async getArticles(@Query() query: GetListArticleDTO) {
    return this.articleService.getArticles(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({ type: CreateArticleDTO })
  async createArticle(@Req() request, @Body() data: CreateArticleDTO) {
    console.log(data);
    const { user } = request;
    return this.articleService.createArticle(data, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:articleId')
  @ApiParam({
    name: 'articleId',
    required: true,
    type: String,
  })
  @ApiBody({ type: UpdateArticleDTO })
  async updateArticle(
    @Req() request,
    @Body() data: UpdateArticleDTO,
    @Param('articleId') articleId: number,
  ) {
    const { user } = request;
    return this.articleService.updateArticle(user, articleId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:articleId')
  @ApiParam({
    name: 'articleId',
    required: true,
    type: String,
  })
  async deleteArticle(@Req() request, @Param('articleId') articleId: number) {
    const { user } = request;
    return this.articleService.deleteArticle(user, articleId);
  }
}
