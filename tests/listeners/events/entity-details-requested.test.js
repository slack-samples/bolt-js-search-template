import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { entityDetailsRequestedCallback } from '../../../listeners/events/entity-details-requested.js';
import { SampleDataService, SlackResponseError } from '../../../listeners/sample-data-service.js';
import { fakeClient, fakeLogger, fakeSampleData, fakeSlackResponse } from '../../helpers.js';

const validEvent = {
  external_ref: { id: fakeSampleData[0].external_ref.id },
  trigger_id: 'trigger123',
  link: { url: 'https://github.com/slack-samples/bolt-js-getting-started' },
};

const mockFetchSampleData = mock.method(SampleDataService, 'fetchSampleData');

const buildArguments = ({ client = fakeClient, event = validEvent, logger = fakeLogger }) => {
  return {
    client,
    event,
    logger,
  };
};

describe('entityDetailsRequestedCallback', () => {
  beforeEach(() => {
    fakeClient.apiCall.mock.resetCalls();
    fakeLogger.resetCalls();
    mockFetchSampleData.mock.resetCalls();
    mockFetchSampleData.mock.mockImplementation(() => Promise.resolve(fakeSlackResponse));
    fakeClient.apiCall.mock.mockImplementation(() => Promise.resolve({ ok: true }));
  });

  it('should successfully process valid entity details requested event', async () => {
    await entityDetailsRequestedCallback(buildArguments({}));

    assert(mockFetchSampleData.mock.callCount() === 1);
    const fetchCallArgs = mockFetchSampleData.mock.calls[0].arguments[0];
    assert(fetchCallArgs.client);

    assert(fakeClient.apiCall.mock.callCount() === 1);
    assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments[0], 'entity.presentDetails');
    assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments[1], {
      trigger_id: validEvent.trigger_id,
      metadata: {
        entity_type: 'slack#/entities/item',
        url: validEvent.link.url,
        external_ref: validEvent.external_ref,
        entity_payload: {
          attributes: {
            title: {
              text: fakeSampleData[0].title,
              edit: {
                enabled: false,
                text: {
                  max_length: 50,
                },
              },
            },
          },
          custom_fields: [
            {
              key: 'description',
              label: 'Description of sample',
              type: 'string',
              value: fakeSampleData[0].description,
            },
            {
              key: 'date_updated',
              label: 'Last updated',
              type: 'string',
              value: fakeSampleData[0].date_updated,
            },
            {
              key: 'content',
              label: 'Details of sample',
              type: 'string',
              value: fakeSampleData[0].content,
            },
          ],
        },
      },
    });
  });

  it('should handle sample with missing content field', async () => {
    const eventForSampleWithoutContent = {
      external_ref: { id: fakeSampleData[2].external_ref.id },
      trigger_id: 'trigger123',
      link: { url: 'https://github.com/slack-samples/bolt-ts-starter' },
    };

    await entityDetailsRequestedCallback(buildArguments({ event: eventForSampleWithoutContent }));

    assert(fakeClient.apiCall.mock.callCount() === 1);
    assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments[0], 'entity.presentDetails');
    assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments[1], {
      trigger_id: eventForSampleWithoutContent.trigger_id,
      metadata: {
        entity_type: 'slack#/entities/item',
        url: eventForSampleWithoutContent.link.url,
        external_ref: eventForSampleWithoutContent.external_ref,
        entity_payload: {
          attributes: {
            title: {
              text: fakeSampleData[2].title,
              edit: {
                enabled: false,
                text: {
                  max_length: 50,
                },
              },
            },
          },
          custom_fields: [
            {
              key: 'description',
              label: 'Description of sample',
              type: 'string',
              value: fakeSampleData[2].description,
            },
            {
              key: 'date_updated',
              label: 'Last updated',
              type: 'string',
              value: fakeSampleData[2].date_updated,
            },
            // Note: No content field should be included
          ],
        },
      },
    });
  });

  it('should handle sample not found in response', async () => {
    await entityDetailsRequestedCallback(
      buildArguments({
        event: {
          external_ref: { id: 'non-existent-sample' }, // invalid id
          trigger_id: 'trigger123',
          link: { url: 'https://example.com' },
        },
      }),
    );

    assert(mockFetchSampleData.mock.callCount() === 1);
    assert(fakeLogger.warn.mock.callCount() === 1);
    assert(
      fakeLogger.warn.mock.calls[0].arguments[0].includes(
        'Failed to find sample data with external reference id: non-existent-sample',
      ),
    );
  });

  it('should handle SlackResponseError from fetchSampleData', async () => {
    mockFetchSampleData.mock.mockImplementation(() => {
      throw new SlackResponseError('Failed to fetch sample data from Slack API');
    });

    await entityDetailsRequestedCallback(buildArguments({}));
    assert(fakeLogger.error.mock.callCount() === 1);
    assert(fakeLogger.error.mock.calls[0].arguments[0].includes('Failed to fetch or parse sample data'));
  });

  it('should handle unexpected errors', async () => {
    mockFetchSampleData.mock.mockImplementation(() => {
      throw new TypeError('Unexpected error');
    });

    await entityDetailsRequestedCallback(buildArguments({ logger: fakeLogger }));

    assert(fakeLogger.error.mock.callCount() === 1);
    assert(
      fakeLogger.error.mock.calls[0].arguments[0].includes(
        'Unexpected error occurred while processing entity_details_requested event',
      ),
    );
  });

  it('should handle empty samples array', async () => {
    mockFetchSampleData.mock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        samples: [],
      }),
    );

    await entityDetailsRequestedCallback(buildArguments({ logger: fakeLogger }));

    assert(fakeLogger.warn.mock.callCount() === 1);
    assert(
      fakeLogger.warn.mock.calls[0].arguments[0].includes(
        `Failed to find sample data with external reference id: ${validEvent.external_ref.id}`,
      ),
    );
  });
});
