const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// Endpoint untuk menerima URL gambar dan menghasilkan prompt
app.get('/img2prompt', async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        return res.status(400).json({ error: 'URL gambar diperlukan' });
    }

    try {
        // Unduh gambar dari URL
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageData = Buffer.from(imageResponse.data, 'binary').toString('base64');

        // Kirim gambar ke API Replicate
        const replicateResponse = await axios.post(
            `https://api.replicate.com/v1/predictions`,
            {
                version: process.env.MODEL_ID,
                input: {
                    image: imageData
                }
            },
            {
                headers: {
                    'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const prompt = replicateResponse.data.output;
        res.json({ prompt });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate prompt' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
