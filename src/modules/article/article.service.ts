import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// Entity
import { Article, User } from 'src/entities/';

// DTO
import {
  CreateArticleDTO,
  GetListArticleDTO,
  SearchArticleDTO,
  UpdateArticleDTO,
} from './dto';

// Service
import { ArticleSearchService } from './articleSearch.service';
import { calculatePaginate } from 'src/utils/pagination';

@Injectable()
export class ArticleService {
  index = 'articles';
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,

    private articleSearchService: ArticleSearchService,
  ) {}

  async createArticle(article: CreateArticleDTO, user: User) {
    const newArticle = await this.articleRepo.create({
      ...article,
      createdBy: user,
    });

    await this.articleRepo.save(newArticle);
    this.articleSearchService.indexArticle(newArticle);

    return newArticle;
  }

  async searchForArticle(searchQuery: SearchArticleDTO) {
    const results = await this.articleSearchService.search(searchQuery);
    const ids = results.map((result) => result.id);
    if (!ids.length) {
      return [];
    }

    const articles = this.articleRepo.find({
      where: { id: In(ids) },
      relations: ['createdBy'],
    });

    return articles;
  }

  async getArticles(searchQuery: GetListArticleDTO) {
    const { page, perPage, sortByDate } = searchQuery;
    const { limit, skip, currentPage } = calculatePaginate(page, perPage);

    const [articles, count] = await this.articleRepo.findAndCount({
      where: {
        deleteSoft: false,
      },
      relations: ['createdBy'],
      order: {
        id: sortByDate ?? 'asc',
      },
      skip: skip,
      take: limit,
    });

    return {
      articles,
      meta: {
        total: count,
        page: currentPage,
        perPage: limit,
      },
    };
  }

  async updateArticle(user: User, articleId: number, data: UpdateArticleDTO) {
    const updatedArticle = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['createdBy'],
    });
    if (updatedArticle.createdBy.id !== user.id) {
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
    }

    Object.keys(data).map((key) => {
      updatedArticle[key] = data[key];
    });
    this.articleRepo.save(updatedArticle);

    return updatedArticle;
  }

  async deleteArticle(user: User, articleId: number) {
    const updatedArticle = await this.articleRepo.findOne({
      where: { id: articleId },
      relations: ['createdBy'],
    });

    if (updatedArticle.createdBy.id !== user.id) {
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
    }

    await this.articleRepo.update(articleId, { deleteSoft: true });
    await this.articleSearchService.remove(articleId);
  }
}
