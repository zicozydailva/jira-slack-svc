import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('fetch-channels')
  async fetchAllChannels() {
    const res = await this.slackService.fetchAllChannels();

    return {
      data: res,
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    };
  }

  @Get('messages')
  async getAllSlackMessages() {
    const res = await this.slackService.fetchAllSlackMessages();

    return {
      data: res,
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    };
  }

  @Post('messages/send')
  async sendMessageToSlackChannel(
    @Body('channelName') channelName: string,
    @Body('message') message: string,
  ) {
    const res = await this.slackService.sendMessageToSlackChannel(
      channelName,
      message,
    );

    return {
      data: res,
      message: 'Message Sent To Slack Channel Successfully',
      status: HttpStatus.OK,
    };
  }
}
