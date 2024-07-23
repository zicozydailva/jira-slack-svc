import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';
import { ErrorHelper } from 'src/helpers/error.utils';

@Injectable()
export class SlackService {
  private logger = new Logger(SlackService.name);
  private slackApiToken = this.configService.get<string>('SLACK_API_TOKEN');
  private slackBaseUrl = 'https://slack.com/api';

  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    private configService: ConfigService,
  ) {}

  async fetchAllChannels(): Promise<void> {
    try {
      const response = await axios.get(
        `${this.slackBaseUrl}/conversations.list`,
        {
          headers: { Authorization: `Bearer ${this.slackApiToken}` },
        },
      );

      if (!response.data.ok) {
        this.logger.error(`[conversations.list] error: ${response.data.error}`);
        ErrorHelper.BadRequestException(response.data.error);
      }

      const channels = response.data.channels;
      const channelNames = channels.map((channel) => channel.name);

      this.logger.log('Channels:', channelNames);

      return channelNames;
    } catch (error) {
      this.logger.error('Error fetching channels:', error);
    }
  }

  private async getChannelId(channelName: string): Promise<string> {
    const response = await axios.get(
      `${this.slackBaseUrl}/conversations.list`,
      {
        headers: { Authorization: `Bearer ${this.slackApiToken}` },
      },
    );

    if (!response.data.ok) {
      this.logger.error(`[conversations.list] error: ${response.data.error}`);
      ErrorHelper.BadRequestException(response.data.error);
    }

    const channel = response.data.channels.find(
      (ch) => ch.name === channelName,
    );

    if (!channel) {
      ErrorHelper.NotFoundException(`Channel ${channelName} not found`);
    }

    return channel.id;
  }

  async fetchSlackMessages(channelName: string) {
    const channelId = await this.getChannelId(channelName);

    try {
      const response = await axios.get(
        `${this.slackBaseUrl}/conversations.history`,
        {
          headers: { Authorization: `Bearer ${this.slackApiToken}` },
          params: { channel: channelId },
        },
      );

      const messages = response.data.messages;

      for (const message of messages) {
        const timestamp = new Date(parseFloat(message.ts) * 1000);

        // Check if the message already exists in the database
        const existingMessage = await this.slackMessageRepository.findOne({
          where: {
            userId: message.user,
            timestamp: timestamp,
          },
        });

        if (!existingMessage) {
          const slackMessage = this.slackMessageRepository.create({
            userId: message.user,
            message: message.text,
            timestamp: timestamp,
          });
          await this.slackMessageRepository.save(slackMessage);
          return slackMessage;
        } else {
          // to ensure duplicates aren't saved to database, instead logged out
          this.logger.log(
            `Message already exists in the database: USERID: ${message.user}`,
            message.text,
          );
        }
      }
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES) // ensuring slack messages syncs every 5 minutes interval
  async handleCronSyncSlackMessages() {
    // log to validate cron-job is asynchronously pulling slack activites into database
    this.logger.log('[handleCronSyncSlackMessages]:: TRIGGERED');

    // channel name - random | general etc
    await this.fetchSlackMessages('random');
  }

  async fetchAllSlackMessages() {
    return await this.slackMessageRepository.find();
  }

  // handler to enable dashboard default user send message to slack channel via dashboard API
  async sendMessageToSlackChannel(
    channelName: string,
    message: string,
  ): Promise<void> {
    try {
      const channelId = await this.getChannelId(channelName);

      const response = await axios.post(
        `${this.slackBaseUrl}/chat.postMessage`,
        {
          channel: channelId,
          text: message,
        },
        {
          headers: { Authorization: `Bearer ${this.slackApiToken}` },
        },
      );

      if (!response.data.ok) {
        this.logger.error(`[chat.postMessage] error: ${response.data.error}`);
        ErrorHelper.BadRequestException(response.data.error);
      }
      this.logger.log('Message sent successfully:', response.data.message.text);

      return response.data;
    } catch (error) {
      this.logger.error('Error sending message to Slack:', error);
      throw error;
    }
  }
}
