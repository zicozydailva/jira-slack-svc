import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';
import { ErrorHelper } from 'src/helpers/error.utils';
import { slackMessageData } from '../seed/data/slack';

@Injectable()
export class SlackService {
  private logger = new Logger(SlackService.name);
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
  ) {}

  async fetchAllSlackMessages(text?: string) {
    try {
      const query = this.slackMessageRepository.createQueryBuilder('message');

      // Apply search filter for text
      if (text) {
        query.andWhere('message.text LIKE :text', {
          text: `%${text}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.log(error);
      ErrorHelper.BadRequestException(error);
    }
  }

  // async seedSlackMessages() {
  //   this.logger.log('[SEEDING-SLACK] - processing');

  //   const seedPromises = slackMessageData.map(async (data) => {
  //     const existingMessage = await this.slackMessageRepository.findOne({
  //       where: { ts: data.ts },
  //     });
  //     if (!existingMessage) {
  //       return this.slackMessageRepository.save(data);
  //     }
  //   });

  //   await Promise.all(seedPromises);

  //   this.logger.log('[SEEDING-SLACK] - done');
  // }

  async seedSlackMessages() {
    this.logger.log('[SEEDING-SLACK] - processing');

    const batchSize = 100; // Define your batch size
    for (let i = 0; i < slackMessageData.length; i += batchSize) {
      const batch = slackMessageData.slice(i, i + batchSize);

      const seedPromises = batch.map(async (data) => {
        const existingMessage = await this.slackMessageRepository.findOne({
          where: { ts: data.ts },
        });
        if (!existingMessage) {
          return this.slackMessageRepository.save(data);
        }
      });

      await Promise.all(seedPromises); // Process the batch concurrently
      this.logger.log('[SEEDING-SLACK] - processing111');

    }

    this.logger.log('[SEEDING-SLACK] - done');
  }
}
