const core = require('@actions/core');
const github = require('@actions/github');
const slackClient = require('@slack/web-api');

try {
    const token = core.getInput('token')
    const channels = core.getInput('channels')
    console.log(channels);
    console.log(`The event payload ref: ${github.context.payload.ref}`);


    const slack = new slackClient.WebClient(token);
    slack.chat.postMessage({
        channel: channels,
        text: `The event payload ref: ${github.context.payload.ref}`
    })
} catch (error) {
    core.setFailed(error.message);
}