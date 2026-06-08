require('dotenv').config({ override: true });
const express = require('express');
const { connectKafka } = require('./src/kafka/consumer');
const { connectMongo } = require('./src/db/mongo');
const patientRoutes = require('./src/routes/patient');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Mount the router
app.use('/api/patient', patientRoutes);

// Basic health check endpoint to verify the Express server is routing correctly
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Clinical BFF backend is running.' });
});

// Start the Express server
app.listen(PORT, async () => {
    console.log(`Express server initialized and listening on port ${PORT}`);
    
    // Connect to the Kafka stream once the server is up
    try {
        await connectKafka();
        await connectMongo();
    } catch (error) {
        console.error('Failed to connect to Kafka stream:', error);
        process.exit(1); 
    }
});