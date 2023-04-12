import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

// Entity
import { Role, User, Article } from 'src/entities';
import { ArticleSearchService } from '../article/articleSearch.service';

@Injectable()
export class SeederService {
  constructor(
    private readonly logger: Logger,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Article)
    private articleRepo: Repository<Article>,

    private articleSearchService: ArticleSearchService,
  ) {}

  async seed() {
    const users = await this.seedUsers();
    await this.seedArticles(users);
  }

  async seedUsers(): Promise<User[]> {
    try {
      // Delete all role
      await this.roleRepo.delete({});
      // Detele all user
      await this.userRepo.delete({});

      // Create new role
      const role1 = new Role();
      role1.name = 'admin';
      const role2 = new Role();
      role2.name = 'member';
      const role3 = new Role();
      role3.name = 'systemadmin';
      const roles = await Promise.all([
        this.roleRepo.save(role1),
        this.roleRepo.save(role2),
        this.roleRepo.save(role3),
      ]);
      this.logger.debug('Successfuly completed seeding roles...');

      // Create new user
      let users = [];
      const hashedPassword = await bcrypt.hash('123456', 10);
      roles.forEach((role) => {
        const user = new User();

        user.name = faker.name.findName();
        user.email = faker.internet.email();
        user.roles = [role];
        user.password = hashedPassword;

        users.push(this.userRepo.save(user));
      });

      users = await Promise.all(users);
      this.logger.debug('Successfuly completed seeding users...');

      return users;
    } catch (error) {
      console.log(error);
      this.logger.error('Failed seeding users...');
    }
  }

  async seedArticles(users: User[]) {
    try {
      // Delete all article
      await this.articleRepo.delete({});

      let articles = [];
      users.forEach((user) => {
        [1, 2].map((item) => {
          const article = new Article();
          article.title = faker.name.findName();
          article.content =
            'The two new keys are aws:EC2InstanceSourceVPC, a condition key that contains the VPC ID to which an EC2 instance is deployed, and aws:EC2InstanceSourcePrivateIPv4, a condition key that contains the primary IPv4 address of the EC2 instance.';
          article.createdBy = user;

          articles.push(this.articleRepo.save(article));
        });
      });

      articles = await Promise.all(articles);
      articles.forEach((item) => this.articleSearchService.indexArticle(item));

      this.logger.debug('Successfuly completed seeding articles...');
    } catch (error) {
      console.log(error);
      this.logger.error('Failed seeding articles...');
    }
  }
}
