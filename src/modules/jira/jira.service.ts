import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JiraIssue } from './entities';
import { Repository } from 'typeorm';
import { ErrorHelper } from 'src/helpers/error.utils';
import { jiraIssuesData } from '../seed/data/jira';

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

  async seedJiraIssues() {
    this.logger.log('[SEEDING-JIRA] - processing');
  
    const batchSize = 100; // Define your batch size
  
    for (let i = 0; i < jiraIssuesData.length; i += batchSize) {
      const batch = jiraIssuesData.slice(i, i + batchSize);
  
      const seedPromises = batch.map(async (data) => {
        const existingIssue = await this.jiraIssueRepository.findOne({
          where: { id: data.id },
        });
        if (!existingIssue) {
          return this.jiraIssueRepository.save(data);
        }
      });
  
      await Promise.all(seedPromises); // Process the batch concurrently
    }
  
    this.logger.log('[SEEDING-JIRA] - done');
  }
}
