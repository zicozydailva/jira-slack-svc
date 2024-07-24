import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('fetch-messages')
  async getAllSlackMessages(@Query('text') text: string) {
    const res = await this.slackService.fetchAllSlackMessages(text);

    return {
      data: res,
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    };
  }

  @Get('seed-slack-repo')
  async seedSlackMessages() {
    const res = await this.slackService.seedSlackMessages();

    return {
      data: res,
      message: 'Slack Repo Seeded Successfully',
      status: HttpStatus.OK,
    };
  }
}
