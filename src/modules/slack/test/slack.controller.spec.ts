import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { SlackController } from '../slack.controller';
import { SlackService } from '../slack.service';

describe('SlackController', () => {
  let controller: SlackController;
  let service: SlackService;

  const mockSlackService = {
    fetchSlackMessages: jest
      .fn()
      .mockResolvedValue('mocked fetchSlackMessages response'),
    fetchAllChannels: jest
      .fn()
      .mockResolvedValue('mocked fetchAllChannels response'),
    fetchAllSlackMessages: jest
      .fn()
      .mockResolvedValue('mocked fetchAllSlackMessages response'),
    sendMessageToSlackChannel: jest
      .fn()
      .mockResolvedValue('mocked sendMessageToSlackChannel response'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlackController],
      providers: [
        {
          provide: SlackService,
          useValue: mockSlackService,
        },
      ],
    }).compile();

    controller = module.get<SlackController>(SlackController);
    service = module.get<SlackService>(SlackService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch all Slack messages', async () => {
    const result = await controller.getAllSlackMessages();
    expect(service.fetchAllSlackMessages).toHaveBeenCalled();
    expect(result).toEqual({
      data: 'mocked fetchAllSlackMessages response',
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    });
  });
});
