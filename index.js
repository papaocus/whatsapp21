const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { EventEmitter } = require('events');

const app = express();
app.use(bodyParser.json());

const API_URL = 'https://conv.chatclay.com/webhook/voice';
const API_KEY = 'X7EPhTxGee3tnfYCysxQXW'; 

const events = new EventEmitter();  // Create an event emitter

app.post('/chatbot-reply', async (req, res) => {
    // console.log('Received reply from chatbot 2:', req.body);
    events.emit('receivedChatbotReply', req.body);  // Emit event when data is received
    return res.json({ messagePayload: req.body });
});

const handleRequest2 = async (req, res) => {
    const payload = req.body.payload.payload;
    const messagePayload = {
        app: "DemoApp",
        timestamp: req.body.timestamp,
        version: 2,
        type: "message",
        payload: {
            id: payload.id,
            source: req.body.sender.id,
            sender: {
                phone: req.body.sender.id,
                name: req.body.sender.name,
                country_code: "91", // You can adjust this if needed
                dial_code: "8x98xx21x4" // You can adjust this if needed
            }
        }
    };

    if (payload.type === "image") {
        messagePayload.payload.type = "image";
        messagePayload.payload.payload = {
            caption: payload.caption || "", // Optional caption
            url: payload.url,
            contentType: payload.contentType,
            urlExpiry: payload.urlExpiry
        };
    } else if (payload.type === "audio") {
        messagePayload.payload.type = "audio";
        messagePayload.payload.payload = {
            url: payload.url,
            contentType: payload.contentType,
            urlExpiry: payload.urlExpiry
        };
    } else if (payload.type === "video") {
        messagePayload.payload.type = "video";
        messagePayload.payload.payload = {
            caption: payload.caption || "", // Optional caption
            url: payload.url,
            contentType: payload.contentType,
            urlExpiry: payload.urlExpiry
        };
    } else if (payload.type === "document") {
        messagePayload.payload.type = "file";
        messagePayload.payload.payload = {
            caption: payload.caption || "", // Optional caption
            name: payload.name,
            url: payload.url,
            contentType: payload.contentType,
            urlExpiry: payload.urlExpiry
        };
    } else if (payload.type === "sticker") {
        messagePayload.payload.type = "sticker";
        messagePayload.payload.payload = {
            url: payload.url,
            contentType: payload.contentType,
            urlExpiry: payload.urlExpiry
        };
    } else {
        // Handle other types or scenarios as needed
    }

    try {
        const response = await axios.post(API_URL, messagePayload, {
            headers: {
                'x-api-key': API_KEY,
                'content-type': 'application/json'
            }
        });

        // Await for the event to be emitted
        const answer = await new Promise(resolve => events.once('receivedChatbotReply', resolve));
        let parsedPayload = JSON.parse(answer.messagePayload);
        console.log('Received text:', parsedPayload.text);

        // Return the message from the chatbot-reply response
        return res.send(parsedPayload.text);
    } catch (error) {
        console.error('Error calling the API:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: 'Failed to call the API' });
    }
};
app.post('/callback', async (req, res) => {
    console.log('Received request from Gupshup:', req.body);
    await handleRequest2(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
