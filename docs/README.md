# ResearchHub - Academic Research Platform

ResearchHub is a decentralized platform for academic researchers to store, share, and access research papers and datasets. The platform leverages Walrus decentralized storage to ensure data integrity and availability, making academic resources universally accessible.

## Features

- **Secure Storage**: Store research papers and datasets securely using Walrus decentralized storage
- **Access Control**: Control who can access your research with fine-grained permissions
- **Search & Discovery**: Find relevant research papers and datasets through advanced search capabilities
- **Version Control**: Track changes to research papers and datasets over time
- **Collaboration**: Collaborate with other researchers on shared projects
- **Citations & References**: Easily cite and reference other research papers

## Technology Stack

- **Frontend**: React
- **Backend**: Sui Move
- **Storage**: Walrus Decentralized Storage
- **Blockchain**: Sui Network

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Sui CLI
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/research-hub.git
   cd research-hub
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install Sui CLI (if not already installed):
   ```
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch main sui
   ```

4. Build and publish the Move modules:
   ```
   cd backend
   sui move build
   sui client publish --gas-budget 10000000
   ```

5. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

## Usage

1. Register or log in to your account
2. Upload research papers or datasets
3. Set access permissions for your uploads
4. Search for and access research shared by other researchers
5. Collaborate with other researchers on shared projects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
