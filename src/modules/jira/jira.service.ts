import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JiraIssue } from './entities';
import { Repository } from 'typeorm';

@Injectable()
export class JiraService {
  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepository: Repository<JiraIssue>,
  ) {}

  async fetchJiraIssues() {
    try {
      const response = await axios.get(
        'https://your-domain.atlassian.net/rest/api/2/search',
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
          },
        },
      );

      const issues = response.data.issues;

      for (const issue of issues) {
        const jiraIssue = this.jiraIssueRepository.create({
          issueId: issue.id,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          createdAt: new Date(issue.fields.created),
        });
        await this.jiraIssueRepository.save(jiraIssue);
      }
    } catch (error) {}
  }
}
