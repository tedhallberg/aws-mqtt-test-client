import * as mqtt from 'mqtt';
import { log } from './utils/logger';
import { AWSClient } from './client/AWSClient';

// Paths to the client certificate, private key, and AWS IoT root CA
const KEY_PATH = '<PATH to PRIVATE KEY>';
const CERT_PATH = '<PATH to CERTIFICATE>';
const CA_PATH = './certificates/awsRootCA.crt';

// AWS IoT endpoint and client ID
const CLIENT_ID = '<THE CLIENT_ID>'; // Should be thing name when certificate is registered in AWS IoT
const ENDPOINT = '<YOUR AWS IOT ENDPOINT>';

// Topics to subscribe and publish to
const SUB_TOPICS = ['<TOPIC1>', '<TOPIC2>'];
const PUB_TOPIC = `<TOPIC TO PUBLISH TO>`;

// Message to publish
const MESSAGE = 'Hello from test client';

// Create a new AWSClient instance
const client = new AWSClient(mqtt, CERT_PATH, KEY_PATH, CA_PATH, CLIENT_ID);

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
        await client.subscribe(SUB_TOPICS);
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
