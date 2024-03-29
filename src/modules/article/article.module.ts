import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Module
import { SearchModule } from '../search/search.module';

// Controller
import { ArticleController } from './article.controller';

// Service
import { ArticleService } from './article.service';

// Entity
import { Article } from 'src/entities/';
import { ArticleSearchService } from './articleSearch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), SearchModule],
  providers: [ArticleService, ArticleSearchService],
  controllers: [ArticleController],
  exports: [ArticleSearchService],
})
export class ArticleModule {}
