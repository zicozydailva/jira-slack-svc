import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JiraIssue } from './entities';
import { Repository } from 'typeorm';
import { ErrorHelper } from 'src/helpers/error.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JiraService {
  private logger = new Logger(JiraService.name);

  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepository: Repository<JiraIssue>,
    private configService: ConfigService,
  ) {}

  async fetchJiraIssues() {
    const jiraEmail = this.configService.get<string>('JIRA_EMAIL');
    const jiraApiToken = this.configService.get<string>('JIRA_API_TOKEN');
    const jiraDomain = this.configService.get<string>('JIRA_DOMAIN');

    try {
      const response = await axios.get(
        `https://${jiraDomain}/rest/api/2/search`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
          },
        },
      );

      const issues = response.data.issues;

      for (const issue of issues) {
        // Check if the issue already exists in the database
        const existingIssue = await this.jiraIssueRepository.findOne({
          where: { issueId: issue.id },
        });

        if (!existingIssue) {
          // If the issue does not exist, create and save it
          const jiraIssue = this.jiraIssueRepository.create({
            issueId: issue.id,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            createdAt: new Date(issue.fields.created),
          });

          await this.jiraIssueRepository.save(jiraIssue);
          return jiraIssue;
        } else {
          this.logger.log('Issue already exists:', existingIssue);
        }
      }
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  async fetchAllJiraIssues() {
    return await this.jiraIssueRepository.find();
  }
}
