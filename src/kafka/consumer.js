const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'clinical-bff', // New Node app's client ID
  brokers: ['localhost:9092'] // Matching existing docker-compose setup
});

const consumer = kafka.consumer({ groupId: 'dashboard-group' });

const connectKafka = async () => {
  await consumer.connect();
  console.log('Node.js Backend connected to Kafka');

  // Subscribe to the existing topic
  await consumer.subscribe({ topic: 'device-telemetry-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = JSON.parse(message.value.toString());
      console.log(`[Kafka Stream] Received Alert for Device: ${payload.deviceType} | Status: ${payload.status}`);

    },
  });
};

module.exports = { connectKafka };