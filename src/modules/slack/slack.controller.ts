import { Controller, Get, HttpStatus } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('fetch-messages')
  async getAllSlackMessages() {
    const res = await this.slackService.fetchAllSlackMessages();

    return {
      data: res,
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    };
  }
}
