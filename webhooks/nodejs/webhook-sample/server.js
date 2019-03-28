const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;

// This should match the secret specified on the webhook setup in ArtiBot.ai
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
    if (signature !== req.headers['x-artibot-signature'].toLowerCase()) {
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

app.post('*', (req, res) => {
    console.log('Received ArtiBot.ai webhook payload', new Date());
    console.log('Event', req.headers['x-artibot-signature']);
    console.log(req.body);

    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Listening for ArtiBot.ai webhooks on port ${PORT}`);
});
