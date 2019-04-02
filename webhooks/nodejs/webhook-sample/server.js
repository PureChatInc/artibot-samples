const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;

// This is the header that will be sent to you containing the signature of the request
// based on the your secret, the HTTP method, the absolute URI, and the body of
// the request.
const ARTIBOT_SIGNATURE_HEADER = 'x-artibot-signature';

// This is the secret that you entered into your ArtiBot when you setup your webhook.
// For better security do not embed the secret in your source but read it from a
// config file or a key management service.
const WEBHOOK_SECRET = 'testing';

const createSignature = (req) => {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const payload = `${req.method.toUpperCase()}&${url}&${req.buf}`;
    const hmac = crypto.createHmac('sha1', WEBHOOK_SECRET);
    hmac.update(Buffer.from(payload), 'utf-8');
    return hmac.digest('hex');
};

const verifyWebhookSignature = (req, res, next) => {
    const signature = createSignature(req);
    if (signature !== req.headers[ARTIBOT_SIGNATURE_HEADER].toLowerCase()) {
        return res.status(403).send('invalid signature');
    }

    next();
};

const app = express();

app.use(bodyParser.json({
    // verify normally allows us to conditionally abort the parse, but we're using
    // to gain easy access to 'buf', which is a Buffer of the raw request body,
    // which we will need later when we validate the webhook signature
    verify: (req, res, buf) => {
        req.buf = buf;
    }
}));

app.use(verifyWebhookSignature);

// Receives a POST request from ArtiBot and verifies the signature
app.post('*', (req, res) => {
    console.log('Received ArtiBot.ai webhook payload', new Date());
    console.log('Signature', req.headers[ARTIBOT_SIGNATURE_HEADER]);
    console.log(req.body);

    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Listening for ArtiBot.ai webhooks on port ${PORT}`);
});
