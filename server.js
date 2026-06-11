require('dotenv').config({ override: true });
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const { connectKafka } = require('./src/kafka/consumer');
const { connectMongo } = require('./src/db/mongo');
const patientRoutes = require('./src/routes/patient');

const app = express();
const server = http.createServer(app); 

// Allow angular to connect
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use('/api/patient', patientRoutes);

io.on('connection', (socket) => {
    console.log(`[WebSockets] Angular UI Connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[WebSockets] UI Disconnected: ${socket.id}`);
    });
});

server.listen(PORT, async () => {
    console.log(`Express server initialized and listening on port ${PORT}`);
    try {
        await connectMongo(); 
        //pass io so the Kafka consumer can broadcast messages
        await connectKafka(io); 
    } catch (error) {
        console.error('Failed to initialize backing services:', error);
        process.exit(1); 
    }
});