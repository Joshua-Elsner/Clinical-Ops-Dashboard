const mongoose = require('mongoose');

// Define the Schema from the architecture document
const alertSchema = new mongoose.Schema({
    encounter_id: String,
    patient_id: String,
    alert_level: { type: String, default: 'CRITICAL' },
    device_details: { type: Object },
    logged_at: { type: Date, default: Date.now }
});

// Compile the model
const ClinicalAlert = mongoose.model('ClinicalAlert', alertSchema, 'clinical_alerts');

const connectMongo = async () => {
    try {
        // Connect to the local Docker container
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/clinical_command_center';
        await mongoose.connect(mongoUri); 
        console.log('Node.js Backend connected to MongoDB Cache');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = { connectMongo, ClinicalAlert };