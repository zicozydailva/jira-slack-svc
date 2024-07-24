import { Test, TestingModule } from '@nestjs/testing';
import { SlackService } from '../slack.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SlackMessage } from '../entities';
import { Repository } from 'typeorm';
import { ErrorHelper } from 'src/helpers/error.utils';

describe('SlackService', () => {
  let service: SlackService;
  let repository: Repository<SlackMessage>;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockSlackMessageRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackService,
        {
          provide: getRepositoryToken(SlackMessage),
          useValue: mockSlackMessageRepository,
        },
      ],
    }).compile();

    service = module.get<SlackService>(SlackService);
    repository = module.get<Repository<SlackMessage>>(getRepositoryToken(SlackMessage));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAllSlackMessages', () => {
    it('should return all messages when text is not provided', async () => {
      const messages = [new SlackMessage(), new SlackMessage()];
      mockQueryBuilder.getMany.mockResolvedValue(messages);

      const result = await service.fetchAllSlackMessages();
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('message');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(messages);
    });

    it('should return filtered messages when text is provided', async () => {
      const messages = [new SlackMessage()];
      const text = 'test';
      mockQueryBuilder.getMany.mockResolvedValue(messages);

      const result = await service.fetchAllSlackMessages(text);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('message');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('message.text LIKE :text', { text: `%${text}%` });
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(messages);
    });

    it('should handle errors and throw BadRequestException', async () => {
      const error = new Error('test error');
      jest.spyOn(service['logger'], 'log').mockImplementation();
      jest.spyOn(ErrorHelper, 'BadRequestException').mockImplementation(() => { throw error; });
      mockQueryBuilder.getMany.mockRejectedValue(error);

      await expect(service.fetchAllSlackMessages()).rejects.toThrow(error);
      expect(service['logger'].log).toHaveBeenCalledWith(error);
    });
  });
});
