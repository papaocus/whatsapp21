const handleRequest2 = async (req, res) => {
    try {
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
                    country_code: "91", 
                    dial_code: "8x98xx21x4" 
                }
            }
        };
    if (payload.type === "image") {
        messagePayload.payload.type = "image";
        messagePayload.payload.payload = {
            caption: payload.caption || "", 
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
            caption: payload.caption || "", 
            url: payload.url,
            contentType: payload.contentType,
            urlExpiry: payload.urlExpiry
        };
    } else if (payload.type === "document") {
        messagePayload.payload.type = "file";
        messagePayload.payload.payload = {
            caption: payload.caption || "", 
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
    } 

    }

    try {
       const response = await axios.post(API_URL, messagePayload, {
            headers: {
                'x-api-key': API_KEY,
                'content-type': 'application/json'
            }
        });

        const answer = await new Promise(resolve => events.once('receivedChatbotReply', resolve));
        let parsedPayload = JSON.parse(answer.messagePayload);
        console.log('Received text:', parsedPayload.text);

        return res.send(parsedPayload.text);
    } catch (error) {
        console.error('Error calling the API:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: 'Failed to call the API' });
    }
};
