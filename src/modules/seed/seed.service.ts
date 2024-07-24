import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JiraIssue } from '../jira/entities';
import { jiraIssuesData } from './data/jira';

@Injectable()
export class SeederService implements OnModuleInit {
  private logger = new Logger(SeederService.name);
  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepo: Repository<JiraIssue>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('[SEEDING] - starting');

    for (const data of jiraIssuesData) {
      const existingIssue = await this.jiraIssueRepo.findOne({
        where: { id: data.id },
      });
      if (!existingIssue) {
        await this.jiraIssueRepo.save(data);
        this.logger.log('[SEEDING] - processing');
      }
    }

    this.logger.log('[SEEDING] - done');
  }
}
