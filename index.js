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
    const dataToSend = {
        bot: "648701bbbf3af915b60daa2d",
        sender: {
            id: "6505d8ffbd59247f06e0ebaa",
            name: "summer",
            data: {}
        },
        message: {
            text: req.body.payload.payload.text,
            locale: ""
        },
        timestamp: req.body.timestamp
    };

    try {
        const response = await axios.post(API_URL, dataToSend, {
            headers: {
                'x-api-key': API_KEY,
                'content-type': 'application/json'
            }
        });

        // console.log('please', response.data);

        // Await for the event to be emitted
        const answer = await new Promise(resolve => events.once('receivedChatbotReply', resolve));
        let parsedPayload = JSON.parse(answer.messagePayload);
        console.log('Received text:', parsedPayload.text);

        // console.log('answer', answer.messagePayload.text);
        // Return the message from the chatbot-reply response
        return res.send(parsedPayload.text);

    } catch (error) {
        console.error('Error calling the API 3:', error.response ? error.response.data : error.message);
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
