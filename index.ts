import { AWSClient } from 'client/AWSClient';
import * as mqtt from 'mqtt';
import { log } from 'utils/logger';

// Paths to the client certificate, private key, and AWS IoT root CA
const KEY_PATH = 'path_to_private_key';
const CERT_PATH = 'path_to_client_certificate';
const CA_PATH = './certificates/awsRootCA.crt';

// AWS IoT endpoint and client ID
const CLIENT_ID = 'the_client_id';
const ENDPOINT = 'the_broker_endpoint';

// Topics to subscribe and publish to
const SUB_TOPICS = ['list_of_topics_to_subscribe_to'];
const PUB_TOPIC = `some_topic_to_publish_to`;

// Message to publish
const MESSAGE = 'Hello from test client';

// Create a new AWSClient instance
const client = new AWSClient(mqtt, CERT_PATH, KEY_PATH, CA_PATH, CLIENT_ID, SUB_TOPICS);

// Set raw mode to true for capturing individual key presses
process.stdin.setRawMode(true);
process.stdin.resume();

console.log(`
    ==== Usage ====
    Press 'c' to connect to AWS IoT broker ${ENDPOINT}.
    Press 'd' to disconnect.
    Press 's' to subscribe to topics ${SUB_TOPICS}.
    Press 'p' to publish a message to topic ${PUB_TOPIC}.
    Press 'q' to exit the application.

  `);

process.stdin.on('data', async (key) => {
  try {
    const keyPressed = key.toString().trim();
    switch (keyPressed) {
      case 'c':
        log('Connecting to AWS IoT...');
        await client.connect(ENDPOINT);
        break;
      case 'd':
        log('Disconnecting from AWS IoT...');
        client.end();
        break;
      case 'p':
        await client.publish(PUB_TOPIC, MESSAGE);
        break;
      case 's':
        await client.subscribe();
        break;
      case 'q':
        log('Exiting...');
        client.end();
        process.exit();
        break;
      default:
        log('Invalid key. Please press "c", "d", "p", or "q".');
        break;
    }
  } catch (err: any) {
    log('Error:', err.message);
    process.exit();
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  client.end();
  process.exit();
});
