import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';

@Injectable()
export class SlackService {
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
  ) {}

  async fetchAllSlackMessages() {
    return await this.slackMessageRepository.find();
  }
}
