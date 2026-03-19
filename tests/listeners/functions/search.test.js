import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';

import { SearchService, searchCallback } from '../../../listeners/functions/search.js';
import { SampleDataService, SlackResponseError } from '../../../listeners/sample-data-service.js';
import { fakeAck, fakeClient, fakeComplete, fakeFail, fakeLogger, fakeSlackResponse } from '../../helpers.js';

const validInputs = {
  query: 'javascript',
  filters: { language: ['javascript'], type: ['template'] },
  user_context: { id: 'U123456', secret: 'secret123' },
};

const mockFetchSampleData = mock.method(SampleDataService, 'fetchSampleData');

const buildArguments = ({
  ack = fakeAck,
  inputs = validInputs,
  fail = fakeFail,
  complete = fakeComplete,
  client = fakeClient,
  logger = fakeLogger,
}) => {
  return {
    ack,
    inputs,
    fail,
    complete,
    client,
    logger,
  };
};

describe('searchCallback', () => {
  beforeEach(() => {
    fakeAck.mock.resetCalls();
    fakeFail.mock.resetCalls();
    fakeComplete.mock.resetCalls();
    fakeLogger.resetCalls();
    mockFetchSampleData.mock.resetCalls();
    mockFetchSampleData.mock.mockImplementation(() => Promise.resolve(fakeSlackResponse));
  });

  it('should successfully process valid search inputs', async () => {
    await searchCallback(buildArguments({}));

    assert(mockFetchSampleData.mock.callCount() === 1);
    assert.deepStrictEqual(mockFetchSampleData.mock.calls[0].arguments[0], {
      client: fakeClient,
      query: validInputs.query,
      filters: validInputs.filters,
      logger: fakeLogger,
    });
    assert(fakeComplete.mock.callCount() === 1);
    const completeCallArgs = fakeComplete.mock.calls[0].arguments[0];
    assert(completeCallArgs.outputs);
    assert(Array.isArray(completeCallArgs.outputs.search_results));

    assert(fakeAck.mock.callCount() === 1);
    assert(fakeFail.mock.callCount() === 0);
  });

  it('should handle SlackResponseError from fetchSampleData', async () => {
    mockFetchSampleData.mock.mockImplementation(() => {
      throw new SlackResponseError('Failed to fetch sample data from Slack API');
    });

    await searchCallback(buildArguments({}));

    assert(fakeLogger.error.mock.callCount() === 1);
    assert(fakeLogger.error.mock.calls[0].arguments[0].includes('Failed to fetch or parse sample data'));
    assert(fakeFail.mock.callCount() === 1);
    assert.deepStrictEqual(fakeFail.mock.calls[0].arguments[0], {
      error: SearchService.SEARCH_PROCESSING_ERROR_MSG,
    });
    assert(fakeComplete.mock.callCount() === 0);
    assert(fakeAck.mock.callCount() === 1);
  });

  it('should handle unexpected errors', async () => {
    mockFetchSampleData.mock.mockImplementation(() => {
      throw new TypeError('Unexpected error');
    });

    await searchCallback(buildArguments({}));

    assert(fakeLogger.error.mock.callCount() === 1);
    assert(
      fakeLogger.error.mock.calls[0].arguments[0].includes('Unexpected error occurred while processing search request'),
    );
    assert(fakeFail.mock.callCount() === 1);
    assert.deepStrictEqual(fakeFail.mock.calls[0].arguments[0], {
      error: SearchService.SEARCH_PROCESSING_ERROR_MSG,
    });
    assert(fakeAck.mock.callCount() === 1);
  });

  it('should always call ack regardless of success or failure', async () => {
    await searchCallback(buildArguments({}));

    assert(fakeAck.mock.callCount() === 1);

    mockFetchSampleData.mock.resetCalls();
    fakeAck.mock.resetCalls();
    fakeFail.mock.resetCalls();
    fakeComplete.mock.resetCalls();
    fakeLogger.resetCalls();

    mockFetchSampleData.mock.mockImplementation(() => Promise.reject(new Error('Test error')));

    await searchCallback(buildArguments({}));

    assert(fakeAck.mock.callCount() === 1);
  });
});
