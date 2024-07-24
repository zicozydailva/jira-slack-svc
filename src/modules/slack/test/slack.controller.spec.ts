import { Test, TestingModule } from '@nestjs/testing';
import { SlackController } from '../slack.controller';
import { SlackService } from '../slack.service';
import { HttpStatus } from '@nestjs/common';
import { SlackMessage } from '../entities';

describe('SlackController', () => {
  let controller: SlackController;
  let service: SlackService;

  const mockSlackService = {
    fetchAllSlackMessages: jest.fn(),
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

  describe('getAllSlackMessages', () => {
    it('should return a success response with messages', async () => {
      const text = 'test text';
      const messages = [new SlackMessage(), new SlackMessage()];
      mockSlackService.fetchAllSlackMessages.mockResolvedValue(messages);

      const result = await controller.getAllSlackMessages(text);
      expect(result).toEqual({
        data: messages,
        message: 'All Channels Fetched Successfully',
        status: HttpStatus.OK,
      });
      expect(mockSlackService.fetchAllSlackMessages).toHaveBeenCalledWith(text);
    });

    it('should return an empty list if no messages found', async () => {
      const text = 'no messages';
      mockSlackService.fetchAllSlackMessages.mockResolvedValue([]);

      const result = await controller.getAllSlackMessages(text);
      expect(result).toEqual({
        data: [],
        message: 'All Channels Fetched Successfully',
        status: HttpStatus.OK,
      });
      expect(mockSlackService.fetchAllSlackMessages).toHaveBeenCalledWith(text);
    });

    it('should handle errors appropriately', async () => {
      const text = 'error text';
      const error = new Error('Service error');
      mockSlackService.fetchAllSlackMessages.mockRejectedValue(error);

      await expect(controller.getAllSlackMessages(text)).rejects.toThrow(error);
      expect(mockSlackService.fetchAllSlackMessages).toHaveBeenCalledWith(text);
    });
  });
});
