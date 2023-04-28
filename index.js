const core = require('@actions/core');
const github = require('@actions/github');
const slackClient = require('@slack/web-api');

try {
    const token = core.getInput('token')
    const channels = core.getInput('channels')
    let number = core.getInput('number')
    number = number.slice(9);
    console.log(github.context);

    let message = `${github.context.payload.ref}`;
    message = message.slice(11);

    const slack = new slackClient.WebClient(token);
    slack.chat.postMessage({
        channel: channels,
        text: `
PR: *${message}*\n
From: ${github.context.payload.pusher.name}\n
URL: https://github.com/mmz-srf/nora/pull/${number}
        `
    })
} catch (error) {
    core.setFailed(error.message);
}