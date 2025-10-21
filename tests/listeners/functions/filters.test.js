import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';
import { FilterService, filtersCallback } from '../../../listeners/functions/filters.js';
import { fakeAck, fakeComplete, fakeFail, fakeLogger } from '../../helpers.js';

const validInputs = {
  user_context: { id: 'U123456', secret: 'secret123' },
};

const buildArguments = ({
  ack = fakeAck,
  inputs = validInputs,
  fail = fakeFail,
  complete = fakeComplete,
  logger = fakeLogger,
}) => {
  return {
    ack,
    inputs,
    fail,
    complete,
    logger,
  };
};

describe('filtersCallback', () => {
  beforeEach(() => {
    fakeAck.mock.resetCalls();
    fakeFail.mock.resetCalls();
    fakeComplete.mock.resetCalls();
    fakeLogger.resetCalls();
  });

  it('should successfully process valid filter inputs', async () => {
    await filtersCallback(buildArguments({}));

    assert(fakeComplete.mock.callCount() === 1);
    const completeCallArgs = fakeComplete.mock.calls[0].arguments[0];
    assert(completeCallArgs.outputs);
    assert(Array.isArray(completeCallArgs.outputs.filters));
    assert(completeCallArgs.outputs.filters.length === 3);

    const languagesFilter = completeCallArgs.outputs.filters.find((f) => f.name === 'languages');
    assert.deepStrictEqual(languagesFilter, {
      name: 'languages',
      display_name: 'Language',
      display_name_plural: 'Languages',
      type: 'multi_select',
      options: [
        { name: 'Python', value: 'python' },
        { name: 'Java', value: 'java' },
        { name: 'JavaScript', value: 'javascript' },
        { name: 'TypeScript', value: 'typescript' },
      ],
    });

    const templatesFilter = completeCallArgs.outputs.filters.find((f) => f.name === 'template');
    assert.deepStrictEqual(templatesFilter, {
      display_name: 'Templates',
      name: 'template',
      type: 'toggle',
    });

    const samplesFilter = completeCallArgs.outputs.filters.find((f) => f.name === 'sample');
    assert.deepStrictEqual(samplesFilter, {
      display_name: 'Samples',
      name: 'sample',
      type: 'toggle',
    });

    assert(fakeAck.mock.callCount() === 1);
    assert(fakeFail.mock.callCount() === 0);
  });

  it('should fail when user_context is missing', async () => {
    const inputsWithoutUserContext = {};

    await filtersCallback(buildArguments({ inputs: inputsWithoutUserContext }));

    assert(fakeFail.mock.callCount() === 1);
    assert.deepStrictEqual(fakeFail.mock.calls[0].arguments[0], {
      error: FilterService.FILTER_PROCESSING_ERROR_MSG,
    });
    assert(fakeComplete.mock.callCount() === 0);
  });

  it('should handle unexpected errors gracefully', async () => {
    fakeComplete.mock.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    await filtersCallback(buildArguments({}));

    assert(fakeLogger.error.mock.callCount() === 1);
    assert(
      fakeLogger.error.mock.calls[0].arguments[0].includes(
        'Unexpected error occurred while processing filters request',
      ),
    );
    assert(fakeFail.mock.callCount() === 1);
    assert.deepStrictEqual(fakeFail.mock.calls[0].arguments[0], {
      error: FilterService.FILTER_PROCESSING_ERROR_MSG,
    });
    assert(fakeAck.mock.callCount() === 1);
  });

  it('should always call ack regardless of success or failure', async () => {
    await filtersCallback(buildArguments({}));
    assert(fakeAck.mock.callCount() === 1);

    fakeAck.mock.resetCalls();
    fakeFail.mock.resetCalls();
    fakeComplete.mock.resetCalls();
    fakeLogger.resetCalls();

    await filtersCallback(buildArguments({ inputs: { user_context: null } }));
    assert(fakeAck.mock.callCount() === 1);

    fakeAck.mock.resetCalls();
    fakeFail.mock.resetCalls();
    fakeComplete.mock.resetCalls();
    fakeLogger.resetCalls();

    fakeComplete.mock.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    await filtersCallback(buildArguments({}));
    assert(fakeAck.mock.callCount() === 1);
  });
});
