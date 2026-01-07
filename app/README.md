# Bunvel - Backend Service

This directory contains the core backend service for Bunvel, built with [Elysia](https://elysiajs.com) and [Bun](https://bun.sh).

## 📋 About

The backend service provides:
- Authentication (email/password)
- File storage with bucket management
- Real-time WebSocket subscriptions
- Auto-generated REST APIs
- Database management

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.0.0 or later)
- Node.js (v18 or later)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Development

Start the development server:
```bash
bun run dev
```

The API will be available at http://localhost:8000

## 📚 Documentation

For complete documentation, please refer to the [main README](../README.md).