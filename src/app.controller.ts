import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JiraIssue } from './modules/jira/entities';
import { SlackMessage } from './modules/slack/entities';

@Controller('jira-slack/')
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    @InjectRepository(JiraIssue)
    private jiraIssueRepository: Repository<JiraIssue>,
  ) {}

  @Get('analytic-patterns')
  async getPatterns() {
    // Fetch all Jira issues & Slack messages
    const jiraIssues = await this.jiraIssueRepository.find();
    const slackMsgs = await this.slackMessageRepository.find();

    // Initialize a map to keep track of issue mentions
    const issueMentionCount = new Map<string, number>();

    // Create a map for quick lookup of Jira issues by summary
    const jiraIssuesMap = new Map<string, string>(
      jiraIssues.map((issue) => [issue.summary.toLowerCase(), issue.summary]),
    );

    // Process Slack messages to find mentioned Jira issues by summary
    const patterns = slackMsgs.map((message) => {
      const mentionedIssues = [];

      jiraIssuesMap.forEach((summary, lowerSummary) => {
        if (message.text.toLowerCase().includes(lowerSummary)) {
          mentionedIssues.push(summary);

          // Increment mention count for each mentioned issue
          const count = issueMentionCount.get(summary) || 0;
          issueMentionCount.set(summary, count + 1);
        }
      });

      return {
        ...message,
        mentionedIssues,
      };
    });

    // Convert the map to an array for easier use in a chart
    const issueMentionData = Array.from(issueMentionCount.entries()).map(
      ([issue, count]) => ({
        issue,
        count,
      }),
    );

    // Return structured response with detailed analytics
    return {
      data: {
        patterns,
        issueMentionData,
      },
      message: 'Pattern fetched successfully',
      status: 200,
    };
  }
}
