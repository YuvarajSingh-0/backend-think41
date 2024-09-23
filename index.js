const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const cors = require("cors");


const app = express();


// CORS configuration for express (HTTP requests)
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(bodyParser.json());

// Sample database schema for SQL generation
// const dbSchema = `
//     CREATE TABLE employees (
//       id INT PRIMARY KEY,
//       name VARCHAR(100),
//       role VARCHAR(50),
//       salary DECIMAL(10, 2),
//       department_id INT
//     );
//     CREATE TABLE departments (
//       id INT PRIMARY KEY,
//       department_name VARCHAR(100)
//     );
// `;

// Groq API configuration
const groqApiKey = process.env.GROQ_API_KEY;
const groqApiUrl = process.env.GROQ_API_URL;


app.get('/', (req, res) => {
    res.send('Welcome to the SQL generator API');
});

// POST endpoint to generate SQL queries
app.post('/api/generate-sql', async (req, res) => {
    const { userMessage, dbSchema } = req.body;

    try {
        const prompt = `
      The following is the database schema:
      ${dbSchema}
      User request: ${userMessage}
      Generate a valid SQL query based on the schema.
    `;
        const data = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "llama3-8b-8192"
        }

        // Request to Groq API
        const response = await axios.post(groqApiUrl, data, {
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const sqlQuery = response.data.choices[0].message;
        res.json({ sqlQuery });
    } catch (error) {
        console.error('Error generating SQL:', error);
        res.status(500).json({ error: 'Failed to generate SQL query' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
