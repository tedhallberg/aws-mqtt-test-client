import * as fs from 'fs';
import { execSync } from 'child_process';
import { AWSClient } from '../AWSClient';
import { log } from 'src/utils/logger';

const actualLogger = jest.requireActual('src/utils/logger');

// fs mock
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));
const mockReadFileSync = fs.readFileSync as jest.Mock;
mockReadFileSync.mockReturnValue('file content');

// execSync mock
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));
const mockExecSync = execSync as jest.Mock;
mockExecSync.mockReturnValue('sha256 Fingerprint=B1:14:32:88:70:39:D2:A0:D9:F7:15:01:B4:CC:56:14:D9:53:FD:28:6C:6B:C0:69:34:F0:62:B3:ED:B1:9C:BA');

// logger mock
jest.mock('src/utils/logger', () => ({
  log: jest.fn((message, optmessage) => actualLogger.log(message, optmessage)),
}));

// mqtt mock
const eventCallbacks: { [key: string]: any } = {};
const mock: any = {
  connectAsync: jest.fn(() => mock),
  publishAsync: jest.fn(),
  subscribeAsync: jest.fn(),
  on: jest.fn((event, callback) => {
    eventCallbacks[event] = callback;
  }),
  connected: true,
  end: jest.fn(),
};

let awsClient: AWSClient;

describe('AWSClient tests', () => {
  beforeAll(async () => {
    // Create a new instance of the AWSClient
    awsClient = new AWSClient(mock, 'certPath', 'keyPath', 'caPath', 'clientId', ['topic']);

    const expectedMqttOptions = {
      port: 443,
      ALPNProtocols: ['x-amzn-mqtt-ca'],
      protocolVersion: 5,
      protocol: 'mqtts',
      clientId: 'clientId',
      key: 'file content',
      cert: 'file content',
      ca: 'file content',
      clean: true,
      reconnectPeriod: 0,
    };
    // Verify that the client is initialized correctly
    expect(awsClient.mqttOptions).toStrictEqual(expectedMqttOptions);
    expect(awsClient.certificateId).toBe('b11432887039d2a0d9f71501b4cc5614d953fd286c6bc06934f062b3edb19cba');

    // Connect the client
    await awsClient.connect('test');

    // Test the connect flow
    expect(mock.connectAsync).toHaveBeenCalledWith('mqtts://test', awsClient.mqttOptions);
    expect(mock.on).toHaveBeenCalledWith('packetreceive', expect.any(Function));
    expect(mock.on).toHaveBeenCalledWith('packetsend', expect.any(Function));
    expect(mock.on).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mock.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mock.on).toHaveBeenCalledWith('close', expect.any(Function));
    expect(mock.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mock.on).toHaveBeenCalledWith('end', expect.any(Function));
  }),
    afterEach(() => {
      jest.clearAllMocks();
    });

  test('that subscribeAsync is correctly called when client is connected', async () => {
    mock.connected = true;
    await awsClient.subscribe();
    expect(mock.subscribeAsync).toHaveBeenCalledWith(['topic']);
  });

  test('that subscribeAsync is not called when client is not connected', async () => {
    mock.connected = false;
    await awsClient.subscribe();
    expect(mock.subscribeAsync).not.toHaveBeenCalled();
  });

  test('that publishAsync is correctly called when client is connected', async () => {
    mock.connected = true;
    await awsClient.publish('topic', 'message');
    expect(mock.publishAsync).toHaveBeenCalledWith('topic', 'message');
  });

  test('that publishAsync is not called when client is not connected', async () => {
    mock.connected = false;
    await awsClient.publish('topic', 'message');
    expect(mock.publishAsync).not.toHaveBeenCalled();
  });

  test('that onMessageHandler is correctly invoked when a message arrives', async () => {
    await eventCallbacks.message('topic', 'message');
    expect(log).toHaveBeenCalledWith(' <--   Received on topic topic: message');
  });

  test('that onErrorHandler is correctly invoked when there is an error event', async () => {
    await eventCallbacks.error(new Error('error'));
    expect(log).toHaveBeenCalledWith('Client error:', 'error');
  });

  test('that onCloseHandler is correctly invoked when there is a close event', async () => {
    await eventCallbacks.close();
    expect(log).toHaveBeenCalledWith('Connection closed.');
  });

  test('that onDisconnectHandler is correctly invoked when there is a disconnect event', async () => {
    await eventCallbacks.disconnect({ properties: { reasonString: 'reason' } });
    expect(log).toHaveBeenCalledWith('Client disconnected.');
    expect(log).toHaveBeenCalledWith('Reason:', 'reason');
  });

  test('that onEndHandler is correctly invoked when there is an end event', async () => {
    await eventCallbacks.end();
    expect(log).toHaveBeenCalledWith('Client ended.');
  });

  test('that onPacketHandler is correctly invoked when there is a packet', async () => {
    await eventCallbacks.packetreceive('packet receive');
    await eventCallbacks.packetsend('packet send');
    expect(log).toHaveBeenCalledWith('Packet received:', 'packet receive');
    expect(log).toHaveBeenCalledWith('Packet received:', 'packet send');
  });

  test('that onEndHandler is correctly invoked when there is an end event', async () => {
    mock.connected = true;
    awsClient.end();
    expect(mock.end).toHaveBeenCalled();
  });
});
