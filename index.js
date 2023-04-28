const core = require('@actions/core');
const github = require('@actions/github');
const slackClient = require('@slack/web-api');
const createWriteStream= require('fs');
const walkSync = require('walk-sync');
const {createReadStream} = require("fs");

async function run() {
    try {
        const token = core.getInput('token')
        const channels = core.getInput('channels')
        const workdir = 'cypress'
        const slack = new slackClient.WebClient(token);

        let message = `${github.context.payload.ref}`;
        message = message.slice(11);

        const videos = walkSync(workdir, { globs: ['**/*.mp4'] })
        const screenshots = walkSync(workdir, { globs: ['**/*.png'] })

        if (videos.length <= 0 && screenshots.length <= 0) {
            core.debug('No videos or screenshots found. Exiting!')
            core.setOutput('result', 'No videos or screenshots found!')
            return
        }

        core.debug('Sending initial slack message')
        const result = await slack.chat.postMessage({
            text: `
PR: *${message}*\n
From: ${github.context.payload.pusher.name}\n`,
            channel: channels
        })

        const threadID = result.ts
        const channelId = result.channel

        if (screenshots.length > 0) {
            core.debug('Uploading screenshots...')

            await Promise.all(
                screenshots.map(async screenshot => {
                    core.debug(`Uploading ${screenshot}`)

                    await slack.files.upload({
                        filename: screenshot,
                        file: createReadStream(`${workdir}/${screenshot}`),
                        thread_ts: threadID,
                        channels: channelId
                    })
                })
            )

            core.debug('...done!')
        }

        if (videos.length > 0) {
            core.debug('Uploading videos...')

            await Promise.all(
                videos.map(async video => {
                    core.debug(`Uploading ${video}`)

                    await slack.files.upload({
                        filename: video,
                        file: createReadStream(`${workdir}/${video}`),
                        thread_ts: threadID,
                        channels: channelId
                    })
                })
            )

            core.debug('...done!')
        }


        await slack.chat.update({
            ts: threadID,
            channel: channels,
            text: `
    PR: *${message}*\n
    From: ${github.context.payload.pusher.name}\n
            `
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}
run();