# AWS MQTT Test Client

An example/test client that can be used to connect to AWS IoT Core (or any other broker that supports mTLS).

## Table of Contents
- [AWS MQTT Test Client](#aws-mqtt-test-client)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

The AWS MQTT Test Client is a TypeScript-based example client designed to demonstrate how to connect and interact with AWS IoT Core using MQTT and mutual TLS (mTLS). This client can be used to connect to any MQTT broker that supports mTLS.

## Features

- Connect to AWS IoT Core using MQTT
- Supports mutual TLS (mTLS) for secure communication
- Simple configuration and usage

## Prerequisites

- Node.js (>= 12.x)
- npm (>= 6.x)
- AWS account with IoT Core service enabled
- AWS IoT Core certificates (root CA, device certificate, and private key)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tedhallberg/aws-mqtt-test-client.git
   cd aws-mqtt-test-client
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Copy your AWS IoT Core certificates into the `certificates` directory:
   - `root-CA.crt`
   - `deviceCertificate.crt`
   - `privateKey.key`

2. Modify the `index.ts` file with your AWS IoT Core endpoint and client ID:
   ```typescript
   const AWS_IOT_ENDPOINT = 'your-aws-iot-endpoint';
   const CLIENT_ID = 'your-client-id';
   ```

## Usage

To run the client, use the following command:
```bash
npm start
```

This will initiate a connection to the AWS IoT Core and subscribe to a test topic. You can modify the behavior by editing the `index.ts` file.

## Project Structure

- `certificates/`: Directory to store the AWS IoT Core certificates.
- `client/`: Contains the main MQTT client logic.
- `interfaces/`: TypeScript interfaces used in the project.
- `utils/`: Utility functions.
- `index.ts`: Main entry point of the application.
- `.editorconfig`: Editor configuration file.
- `.eslintignore`: ESLint ignore file.
- `.eslintrc.js`: ESLint configuration file.
- `.gitignore`: Git ignore file.
- `package-lock.json`: Automatically generated file for locking dependencies.
- `package.json`: Project metadata and dependencies.
- `tsconfig.json`: TypeScript configuration file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README should provide clear guidance on the purpose, setup, and usage of the AWS MQTT Test Client.
