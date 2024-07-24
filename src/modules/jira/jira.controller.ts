import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('fetch-issues')
  async fetchAllJiraIssues(@Query('summary') summary: string) {
    const res = await this.jiraService.fetchAllJiraIssues(summary);

    return {
      data: res,
      message: 'All Jira Issues Fetched Successfully',
      status: HttpStatus.OK,
    };
  }
}
