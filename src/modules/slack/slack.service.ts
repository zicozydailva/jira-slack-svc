import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';
import { ErrorHelper } from 'src/helpers/error.utils';

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
}
