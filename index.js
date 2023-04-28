const core = require('@actions/core');
const github = require('@actions/github');
const slackClient = require('@slack/web-api');

try {
    const token = core.getInput('token')
    const channels = core.getInput('channels')
    console.log(channels);
    console.log(github.context.payload);

    let message = `${github.context.payload.ref}`;
    message = message.slice(11);

    const slack = new slackClient.WebClient(token);
    slack.chat.postMessage({
        channel: channels,
        text: `*${message}*\n
            ${github.context.payload.repository.pulls_url}
        `
    })
} catch (error) {
    core.setFailed(error.message);
}