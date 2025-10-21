# Bolt for JavaScript Search Template

> ⚠️ **Beta Notice**: This template demonstrates search functionality that is currently in beta and not yet widely available to all developers. The features shown here are being tested and may change before general availability.

This is a Slack app template for building search functionality using Bolt for Node. It demonstrates how to create custom functions for search and filtering capabilities.

It's recommended to use a [Slack sandbox](https://docs.slack.dev/tools/developer-sandboxes/) for development and testing. Other workspaces may not have access to all these features. To get started:

1. Join the [Slack Developer Program](https://api.slack.com/developer-program) if you haven't already
2. [Provision a sandbox workspace](https://docs.slack.dev/tools/developer-sandboxes/#provision)

## Installation

### Using Slack CLI

Install the latest version of the Slack CLI for your operating system:

- [Slack CLI for macOS & Linux](https://docs.slack.dev/tools/slack-cli/guides/installing-the-slack-cli-for-mac-and-linux/)
- [Slack CLI for Windows](https://docs.slack.dev/tools/slack-cli/guides/installing-the-slack-cli-for-windows/)

You'll also need to log in if this is your first time using the Slack CLI.

```sh
slack login
```

#### Initializing the project

```sh
slack create bolt-js-search --template slack-samples/bolt-js-search-template
cd bolt-js-search
```

#### Creating the Slack app

```sh
slack install
```

#### Running the app

```sh
slack run
```

<details>
<summary><h3>Using Terminal</h3></summary>

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and choose "From an app manifest"
2. Choose the workspace you want to install the application to
3. Copy the contents of [manifest.json](./manifest.json) into the text box that says `*Paste your manifest code here*` (within the JSON tab) and click _Next_
4. Review the configuration and click _Create_
5. Click _Install to Workspace_ and _Allow_ on the screen that follows. You'll then be redirected to the App Configuration dashboard.

#### Environment Variables

Before you can run the app, you'll need to store some environment variables.

1. Copy `env.sample` to `.env`
2. Open your apps configuration page from [this list](https://api.slack.com/apps), click _OAuth & Permissions_ in the left hand menu, then copy the _Bot User OAuth Token_ into your `.env` file under `SLACK_BOT_TOKEN`
3. Click _Basic Information_ from the left hand menu and follow the steps in the _App-Level Tokens_ section to create an app-level token with the `connections:write` scope. Copy that token into your `.env` as `SLACK_APP_TOKEN`.

##### Install Dependencies

`npm install`

##### Run Bolt Server

`npm start`

</details>

## Testing

Run the code linting and tests:

```sh
npm test
```

Format the source code:

```sh
npm run lint:fix
```

## Project Structure

### `manifest.json`

`manifest.json` is a configuration for Slack apps. With a manifest, you can create an app with a pre-defined configuration, or adjust the configuration of an existing app.

### `app.js`

`app.js` is the entry point for the application and is the file you'll run to start the server. This project aims to keep this file as thin as possible, primarily using it as a way to route inbound requests.

### `/listeners`

Every incoming request is routed to a "listener". Inside this directory, we group each listener based on the Slack Platform feature used, so `/listeners/events` handles incoming [Events](https://docs.slack.dev/reference/events) requests, `/listeners/functions` handles [custom steps](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps) and so on.

### `/test`

The `/test` directory contains the test suite for this project. It mirrors the structure of the source code, with test files corresponding to their implementation counterparts. For example, tests for files in `/listeners/functions` are located in `/test/listeners/functions`.
