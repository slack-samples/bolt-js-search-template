import { mock } from 'node:test';

export const fakeLogger = {
  debug: mock.fn(),
  info: mock.fn(),
  warn: mock.fn(),
  error: mock.fn(),
  resetCalls() {
    fakeLogger.debug.mock.resetCalls();
    fakeLogger.info.mock.resetCalls();
    fakeLogger.warn.mock.resetCalls();
    fakeLogger.error.mock.resetCalls();
  },
};

export const fakeClient = { apiCall: mock.fn() };

export const fakeAck = mock.fn();
export const fakeFail = mock.fn();
export const fakeComplete = mock.fn();

export const fakeSampleData = [
  {
    title: 'JavaScript Getting Started',
    description: 'A template for building Slack apps with Bolt for JavaScript.',
    link: 'https://github.com/slack-samples/bolt-js-getting-started',
    date_updated: '2025-01-01',
    external_ref: { id: 'bolt-js-getting-started' },
    content: 'This quickstart guide helps you get a Slack app using Bolt for JavaScript up and running.',
  },
  {
    title: 'Python AI Assistant',
    description: 'A template for building AI-enabled apps with Bolt for Python.',
    link: 'https://github.com/slack-samples/bolt-python-assistant',
    date_updated: '2025-01-02',
    external_ref: { id: 'bolt-python-assistant' },
    content: 'Create an AI assistant using Python and machine learning capabilities.',
  },
  {
    title: 'TypeScript Starter',
    description: 'A starter template for TypeScript Slack apps.',
    link: 'https://github.com/slack-samples/bolt-ts-starter',
    date_updated: '2025-01-03',
    external_ref: { id: 'bolt-ts-starter' },
  },
];

export const fakeSlackResponse = {
  ok: true,
  samples: fakeSampleData,
};
