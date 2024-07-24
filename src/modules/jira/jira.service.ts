import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JiraIssue } from './entities';
import { Repository } from 'typeorm';
import { ErrorHelper } from 'src/helpers/error.utils';

@Injectable()
export class JiraService {
  private logger = new Logger(JiraIssue.name);
  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepository: Repository<JiraIssue>,
  ) {}

  async fetchAllJiraIssues(summary?: string) {
    try {
      const query = this.jiraIssueRepository.createQueryBuilder('issue');

      // Apply search filter for summary
      if (summary) {
        query.andWhere('issue.summary LIKE :summary', {
          summary: `%${summary}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.log(error);
      ErrorHelper.BadRequestException(error);
    }
  }
}
