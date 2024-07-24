import { Test, TestingModule } from '@nestjs/testing';
import { JiraService } from '../jira.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JiraIssue } from '../entities';
import { Repository } from 'typeorm';

describe('JiraService', () => {
  let service: JiraService;
  let repository: Repository<JiraIssue>;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockJiraIssueRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JiraService,
        {
          provide: getRepositoryToken(JiraIssue),
          useValue: mockJiraIssueRepository,
        },
      ],
    }).compile();

    service = module.get<JiraService>(JiraService);
    repository = module.get<Repository<JiraIssue>>(
      getRepositoryToken(JiraIssue),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAllJiraIssues', () => {
    it('should return all issues when summary is not provided', async () => {
      const issues = [new JiraIssue(), new JiraIssue()];
      mockQueryBuilder.getMany.mockResolvedValue(issues);

      const result = await service.fetchAllJiraIssues();
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('issue');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(issues);
    });

    it('should return filtered issues when summary is provided', async () => {
      const issues = [new JiraIssue()];
      const summary = 'test';
      mockQueryBuilder.getMany.mockResolvedValue(issues);

      const result = await service.fetchAllJiraIssues(summary);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('issue');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'issue.summary LIKE :summary',
        { summary: `%${summary}%` },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(issues);
    });

    it('should log error and throw BadRequestException on failure', async () => {
      const error = new Error('test error');
      jest.spyOn(service['logger'], 'log').mockImplementation();
      mockQueryBuilder.getMany.mockRejectedValue(error);

      await expect(service.fetchAllJiraIssues()).rejects.toThrow(error);
      expect(service['logger'].log).toHaveBeenCalledWith(error);
    });
  });
});
