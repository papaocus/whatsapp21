const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { EventEmitter } = require('events');

const app = express();
app.use(bodyParser.json());

const API_URL = 'https://conv.chatclay.com/webhook/voice';
const API_KEY = 'JXNHGFmWMDFWZ4LtdHYStE'; 

const events = new EventEmitter();  // Create an event emitter

app.post('/chatbot-reply', async (req, res) => {
    if (req.body.payload && req.body.payload.quickReply) {
        
        const receivedQuickReply = req.body.payload.quickReply;
        console.log('Received quick reply:', receivedQuickReply);
        

      
        return res.json({ messagePayload: 'Received quick reply: ' + receivedQuickReply });
    } else {
        events.emit('receivedChatbotReply', req.body);  // Emit event when data is received
        return res.json({ messagePayload: req.body });
    }
});

const handleRequest2 = async (req, res) => {
    const dataToSend = {
        bot: "6541f452234d442ffb2dc202",
        sender: {
            id: "6505d8ffbd59247f06e0ebaa",
            name: "summer",
            data: {}
        },
        message: {
            text: req.body.payload.payload.text, // Assuming text message is part of payload
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

        // Handle Quick Replies or other expected data from the API response
        if (response.data.payload && response.data.payload.quickReplies) {
            const quickReplies = response.data.payload.quickReplies;
            console.log('Received Quick Replies:', quickReplies);
            // Process the received Quick Replies as needed
        }

        // Return the response message from the chatbot
        return res.send(response.data.message.text);

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
