import { Test, TestingModule } from '@nestjs/testing';
import { JiraController } from '../jira.controller';
import { JiraService } from '../jira.service';
import { HttpStatus } from '@nestjs/common';
import { JiraIssue } from '../entities';

describe('JiraController', () => {
  let controller: JiraController;
  let service: JiraService;

  const mockJiraService = {
    fetchAllJiraIssues: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JiraController],
      providers: [
        {
          provide: JiraService,
          useValue: mockJiraService,
        },
      ],
    }).compile();

    controller = module.get<JiraController>(JiraController);
    service = module.get<JiraService>(JiraService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchAllJiraIssues', () => {
    it('should return a success response with issues', async () => {
      const summary = 'test summary';
      const issues = [new JiraIssue(), new JiraIssue()];
      mockJiraService.fetchAllJiraIssues.mockResolvedValue(issues);

      const result = await controller.fetchAllJiraIssues(summary);
      expect(result).toEqual({
        data: issues,
        message: 'All Jira Issues Fetched Successfully',
        status: HttpStatus.OK,
      });
      expect(mockJiraService.fetchAllJiraIssues).toHaveBeenCalledWith(summary);
    });

    it('should return an empty list if no issues found', async () => {
      const summary = 'no issues';
      mockJiraService.fetchAllJiraIssues.mockResolvedValue([]);

      const result = await controller.fetchAllJiraIssues(summary);
      expect(result).toEqual({
        data: [],
        message: 'All Jira Issues Fetched Successfully',
        status: HttpStatus.OK,
      });
      expect(mockJiraService.fetchAllJiraIssues).toHaveBeenCalledWith(summary);
    });

    it('should handle errors appropriately', async () => {
      const summary = 'error summary';
      const error = new Error('Service error');
      mockJiraService.fetchAllJiraIssues.mockRejectedValue(error);

      await expect(controller.fetchAllJiraIssues(summary)).rejects.toThrow(
        error,
      );
      expect(mockJiraService.fetchAllJiraIssues).toHaveBeenCalledWith(summary);
    });
  });
});
