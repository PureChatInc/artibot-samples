/**
 * This template will make a call to Twitch to check to see if a
 * stream is live. If they are found to be live, it will write out
 * there avatar, status, and link to the stream to the bot.
 * 
 * First step is to obtain an API key from Twitch by going to:
 * https://dev.twitch.tv/console/apps/create
 * 
 * Once you have your API key, put it in the `TWITCH_CLIENT_ID`
 * variable.
 */

const https = require('https');

// API key acquired from Twitch after registering an application.
const TWITCH_CLIENT_ID = '<TWITCH_CLIENT_ID>';

/**
 * Makes API call to Twitch to grab information about the channel.
 * 
 * @param {string} channel Name of Twitch channel to check
 * @returns {object} If stream is not live, this will be null, otherwise it's information about the stream
 */
const getStreamInfo = (channel) => new Promise((resolve, reject) => {
    const requestOptions = {
        host: 'api.twitch.tv',
        port: 443,
        path: `/kraken/streams/${channel}`,
        method: 'GET',
        headers: { 'Client-ID': TWITCH_CLIENT_ID }
    };
    
    const request = https.request(requestOptions, (response) => {
        let data = '';
        
        response.on('data', (d) => { data += d; });
        
        response.on('end', () => {
            const result = JSON.parse(data);
            const isLive = result && result.stream;
            resolve(isLive ? {
                logo: result.stream.channel.logo,
                url: result.stream.channel.url,
                game: result.stream.channel.game,
                status: result.stream.channel.status
            } : null);
        });
        
        response.on('error', () => reject());
    });
    
    request.end();
});

/**
 * ArtiBot Code Handler
 */
exports.handler = async (artibotContext) => {

    const channel = artibotContext.input;
    const channelInfo = await getStreamInfo(channel);

    if (!channelInfo) {
        return {
            value: channel,
            statements: [
                {
                    statement: `${channel} is not live 😢`
                }
            ]
        };
    }

    return {
        value: channel,
        statements: [
            {
                statement: `![${channel}](${channelInfo.logo})`,
                delay: 0
            },
            {
                statement: `${channel} is live! [Watch them here](${channelInfo.url})\n\n${channelInfo.status}`,
                delay: 0
            }
        ]
    };
};
