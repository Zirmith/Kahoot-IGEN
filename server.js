const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// API endpoint to process image and generate description
app.post('/identify-image', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        // Fetch the image as an array buffer
        const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // Get generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Generate AI response
        const result = await model.generateContent([
            {
                inlineData: {
                    data: Buffer.from(imageResp.data).toString('base64'),
                    mimeType: 'image/jpeg',
                },
            },
            'Identify this image  no extra details only what the image is .',
        ]);

        // Send clean response
        res.json({ description: result.response.text.trim() });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to identify image' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});