import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path'; // Import path module

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Enable JSON parsing
app.use(express.static('public')); // Serve static files from 'public' directory

// Serve the HTML file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html')); // Adjust the path if needed
});

app.post('/api/fetch-roadmap', async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const prompt = `Create a roadmap for learning about "${searchTerm}" in a structured format.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            return res.status(response.status).json({ error: errorData });
        }

        const data = await response.json();
        res.json(data.choices[0].message.content); // Return the content directly
    } catch (error) {
        console.error('Error fetching roadmap:', error);
        res.status(500).json({ error: 'Failed to fetch roadmap', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
