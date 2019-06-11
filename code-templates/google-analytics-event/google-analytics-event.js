/**
 * This template will send an event to Google Analytics. This can be used for
 * conversation tracking or sending custom events. Just change the `ea` to be
 * any event you want to track.
 * 
 * This example is designed to be used as a Code Action (code runs
 * without a question being asked.)
 */

const https = require('https');
const querystring = require('querystring');

// Google Analytics tracking ID
const GA_TRACKING_ID = 'UA-XXXXXX-X';

/**
 * ArtiBot Code Handler
 */
exports.handler = (artibotContext, callback) => {

    const eventData = {
        v: 1,                         // Version.
        tid: GA_TRACKING_ID,          // Tracking ID / Property ID.
        cid: artibotContext.lead.id,  // Anonymous Client ID.

        t: 'event',                   // Event hit type
        ec: 'artibot',                // Event Category. Required.
        ea: 'my_artibot_conversation',// Event Action. Required.
        //el: 'label',                // Event label.
        //ev: 'value'                 // Event value.
    };

    const requestBody = querystring.stringify(eventData);

    const options = {
        host: 'www.google-analytics.com',
        port: 443,
        path: '/collect',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    const req = https.request(options, (res) => {
        res.on('end', () => {
            callback({ success: true });
        });
    });

    req.on('error', (error) => {
        throw new Error(error);
    });

    req.write(requestBody);
    req.end();
};
