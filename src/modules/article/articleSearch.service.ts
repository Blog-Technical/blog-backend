import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Article } from 'src/entities';
import { ArticleSearchBody } from './interfaces/articleSearchBody.interface';
import { SearchArticleDTO } from './dto';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { calculatePaginate } from 'src/utils/pagination';
import { ElasticSearchIndex } from 'src/configs/constants/elasticSearch';

@Injectable()
export class ArticleSearchService {
  private index = ElasticSearchIndex.ARTICLE;
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexArticle(article: Article) {
    return this.elasticsearchService.index<ArticleSearchBody>({
      index: this.index,
      body: {
        id: article.id,
        title: article.title,
        content: article.content,
        createdAt: article.createdAt,
      },
    });
  }

  async search(searchQuery: SearchArticleDTO) {
    const { textSearch, page, perPage, sortByDate } = searchQuery;
    const { limit, skip } = calculatePaginate(page, perPage);
    const bodyQuery = {};

    if (textSearch) {
      bodyQuery['query'] = {
        multi_match: {
          query: textSearch,
          fields: ['title', 'content'],
        },
      };
    }
    bodyQuery['sort'] = [{ createdAt: { order: sortByDate ?? 'asc' } }];
    const searchOptions: SearchRequest = {
      index: this.index,
      size: limit,
      from: skip,
      body: bodyQuery,
    };

    const data = await this.elasticsearchService.search<ArticleSearchBody>(
      searchOptions,
    );

    const hits = data.hits.hits;
    const results = hits.map((item) => item._source);

    return results;
  }

  async remove(articleId: number) {
    this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: articleId,
          },
        },
      },
    });
  }
}
