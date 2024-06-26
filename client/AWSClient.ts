import { IAWSClient } from 'interfaces/IAWSClient';
import * as mqtt from 'mqtt';
import * as fs from 'fs';
import { log } from 'utils/logger';
import { execSync } from 'child_process';

const LOG_PACKETS = true; // Set to true to log all packets

/**
 * @class AWSClient
 * @description The AWSClient class used for testing connections to AWS IoT core
 */
export class AWSClient implements IAWSClient {
  mqttOptions: mqtt.IClientOptions;

  client!: mqtt.MqttClient;

  /**
   * @param {mqtt} mqttClient the injected mqtt client
   * @param {string} caPath the path to the device cert
   * @param {string} keyPath the path to the device private key
   * @param {string} certPath the patch to the AWS IoT root CA
   * @param {string} clientId the client id
   * @param {string[]} subscriptionTopics the topics to subscribe to
   */
  constructor(
    private mqttClient: typeof mqtt,
    private certPath: string,
    private keyPath: string,
    private caPath: string,
    private clientId: string,
    private subscriptionTopics: string[]
  ) {
    log('Initializing new AWS IoT client instance');
    this.mqttOptions = {
      port: 443,
      ALPNProtocols: ['x-amzn-mqtt-ca'],
      protocolVersion: 5,
      protocol: 'mqtts',
      clientId: this.clientId,
      key: fs.readFileSync(this.keyPath),
      cert: fs.readFileSync(this.certPath),
      ca: fs.readFileSync(this.caPath),
      clean: true,
      reconnectPeriod: 0, // Disable automatic reconnect
    };

    console.log(`
    ==== Client configuration ====
    Certificate id: ${AWSClient.generateCertificateId(certPath)}
    Client id: ${this.clientId}
    Certificate path: ${this.certPath}
    Key path: ${this.keyPath}
    CA path: ${this.caPath}
    MQTT version: ${this.mqttOptions.protocolVersion}
    Protocol: ${this.mqttOptions.protocol}
    Port: ${this.mqttOptions.port}
    Clean session: ${this.mqttOptions.clean}
    Reconnect period: ${this.mqttOptions.reconnectPeriod}
`);
    log('Initialized new AWS IoT client instance');
  }

  /**
   * Method to generate the certificate id from a certificate
   * @param {string } certPath the path to the certificate
   * @returns {string} the certificate id
   */
  private static generateCertificateId(certPath: string): string {
    try {
      const opensslCommand = `openssl x509 -noout -fingerprint -sha256 -inform pem -in ${certPath}`;
      const opensslOutput = execSync(opensslCommand).toString();
      const fingerprintLine = opensslOutput.trim().split('=')[1];
      if (fingerprintLine) {
        const fingerprint = fingerprintLine.replace(/:/g, '').toLowerCase();
        return fingerprint;
      }
      throw new Error('Failed to extract fingerprint from OpenSSL output');
    } catch (error) {
      console.error(`Error executing OpenSSL command: ${error}`);
      throw error;
    }
  }

  /**
   * Method to subscribe to topic(s)
   * @returns {void}
   */
  public async subscribe(): Promise<void> {
    try {
      if (!this.client?.connected) {
        log('Client not connected, skipping subscription attempt');
        return;
      }
      log('Subscribing to topics:', this.subscriptionTopics);
      await this.client.subscribeAsync(this.subscriptionTopics);
      log('Successfully subscribed to:', this.subscriptionTopics);
    } catch (err: any) {
      log('Subscription failed: ', err.message);
    }
  }

  /**
   * Method to publish a message to a topic
   * @param {string} topic the topic to publish to
   * @param {string} message the message to send
   * @returns {Promise<void>} a promise
   */
  public async publish(topic: string, message: string): Promise<void> {
    try {
      if (!this.client?.connected) {
        log('Client not connected, skipping sending message');
        return;
      }
      await this.client.publishAsync(topic, message);
      log(` -->   Message published on topic ${topic}. Message: ${message}`);
    } catch (err: any) {
      log('Publish failed: ', err.message);
    }
  }

  /**
   * The handler for 'message' events
   * @param {string} topic the topic message was received on
   * @param {string | Buffer} message the message received
   * @returns {void}
   */
  private static onMessageHandler(topic: String, message: String | Buffer): void {
    log(` <--   Received on topic ${topic}: ${message.toString()}`);
  }

  /**
   * The handler for 'error' events
   * @param {Error} error the error
   * @returns {void}
   */
  private static onErrorHandler(error: Error): void {
    log('Client error:', error.message);
  }

  /**
   * The handler for 'close' events
   * @returns {void}
   */
  private static onCloseHandler(): void {
    log('Connection closed.');
  }

  /**
   * The handler for 'disconnect' events
   * @param {mqtt.Packet} packet the packet
   * @returns {void}
   */
  private static onDisconnectHandler(packet: mqtt.IDisconnectPacket): void {
    log('Client disconnected.');
    if (packet?.properties?.reasonString) {
      log('Reason:', packet.properties.reasonString);
    }
  }

  /**
   * The handler for 'close' events
   * @returns {void}
   */
  private static onEndHandler(): void {
    log('Client ended.');
  }

  /**
   * The handler for 'packet' events
   * @param {mqtt.Packet} packet the packet
   * @returns {void}
   */
  private static onPacketHandler(packet: mqtt.Packet): void {
    if (LOG_PACKETS) log('Packet received:', packet);
  }

  /**
   * The connect method
   * @param {string} brokerEndpoint the AWS IoT endpoint
   * @returns {Promise<void>} a promise
   */
  public async connect(brokerEndpoint: string): Promise<void> {
    try {
      this.client = await this.mqttClient.connectAsync(`${this.mqttOptions.protocol}://${brokerEndpoint}`, this.mqttOptions);
      log('Connected to AWS IoT broker:', brokerEndpoint);
      this.client.on('packetreceive', AWSClient.onPacketHandler);
      this.client.on('packetsend', AWSClient.onPacketHandler);
      this.client.on('message', AWSClient.onMessageHandler);
      this.client.on('error', AWSClient.onErrorHandler);
      this.client.on('close', AWSClient.onCloseHandler);
      this.client.on('disconnect', AWSClient.onDisconnectHandler);
      this.client.on('end', AWSClient.onEndHandler);
    } catch (err: any) {
      log('Connection error:', err.message);
    }
  }

  /**
   * End the client connection
   * @returns {void}
   */
  public end(): void {
    if (this.client?.connected) {
      this.client.end();
    }
  }
}
