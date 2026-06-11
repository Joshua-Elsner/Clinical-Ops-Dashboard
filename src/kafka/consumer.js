const { Kafka } = require('kafkajs');
const { ClinicalAlert } = require('../db/mongo');

const kafka = new Kafka({
  clientId: 'clinical-bff',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'dashboard-group' });

const connectKafka = async (io) => {
  await consumer.connect();
  console.log('Node.js Backend connected to Kafka');
  
  await consumer.subscribe({ topic: 'device-telemetry-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
          // Parse the incoming Kafka buffer into a JavaScript object
          const payload = JSON.parse(message.value.toString());
          console.log(`[Kafka Stream] Received Alert for Device: ${payload.deviceType} | Status: ${payload.status}`);
          
          //Only save if the device requires maintenance
          if (payload.status === 'MAINTENANCE') {
              const newAlert = new ClinicalAlert({
                  encounter_id: payload.encounterId,
                  patient_id: payload.patientId,
                  alert_level: 'CRITICAL',
                  device_details: {
                      device_type: payload.deviceType,
                      timestamp: payload.readingTimestamp
                  }
              });

              // Write to MongoDB
              await newAlert.save();
              console.log(`[MongoDB Cache] Successfully logged CRITICAL maintenance alert for Patient: ${payload.patientId}`);

              io.emit('device_alert', payload);
          }
      } catch (error) {
          console.error('[Kafka Stream] Error processing and saving message:', error);
      }
    },
  });
};

module.exports = { connectKafka };