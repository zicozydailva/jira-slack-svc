import { Test, TestingModule } from '@nestjs/testing';
import { SlackService } from '../slack.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { SlackMessage } from '../entities';

describe('SlackService', () => {
  let service: SlackService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: Repository<SlackMessage>;
  let mockAxios: MockAdapter;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('fake-slack-api-token'),
  };

  const mockSlackMessageRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    mockAxios = new MockAdapter(axios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackService,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(SlackMessage),
          useValue: mockSlackMessageRepository,
        },
      ],
    }).compile();

    service = module.get<SlackService>(SlackService);
    repository = module.get<Repository<SlackMessage>>(
      getRepositoryToken(SlackMessage),
    );
  });

  afterEach(() => {
    mockAxios.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch Slack messages', async () => {
    const channelsResponse = {
      ok: true,
      channels: [{ id: 'channel-id', name: 'general' }],
    };
    const messagesResponse = {
      ok: true,
      messages: [{ user: 'user-id', text: 'Hello', ts: '1627948800.000200' }],
    };

    mockAxios
      .onGet('https://slack.com/api/conversations.list')
      .reply(200, channelsResponse);
    mockAxios
      .onGet('https://slack.com/api/conversations.history')
      .reply(200, messagesResponse);

    mockSlackMessageRepository.findOne.mockResolvedValue(null);
    mockSlackMessageRepository.create.mockReturnValue({
      userId: 'user-id',
      message: 'Hello',
      timestamp: new Date(1627948800000),
    });
    mockSlackMessageRepository.save.mockResolvedValue({});

    expect(mockAxios.history.get.length).toBe(2);
    expect(mockSlackMessageRepository.findOne).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        timestamp: new Date(1627948800000),
      },
    });
    expect(mockSlackMessageRepository.create).toHaveBeenCalledWith({
      userId: 'user-id',
      message: 'Hello',
      timestamp: new Date(1627948800000),
    });
    expect(mockSlackMessageRepository.save).toHaveBeenCalled();
  });

  it('should fetch all Slack messages from the database', async () => {
    const slackMessages = [
      { userId: 'user-id', message: 'Hello', timestamp: new Date() },
    ];
    mockSlackMessageRepository.find.mockResolvedValue(slackMessages);

    const result = await service.fetchAllSlackMessages();

    expect(result).toEqual(slackMessages);
    expect(mockSlackMessageRepository.find).toHaveBeenCalled();
  });
});
