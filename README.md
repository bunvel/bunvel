# Bunvel

**The fastest open-source backend platform**

Bunvel is a unified Backend-as-a-Service (BaaS) platform that combines authentication, real-time subscriptions, storage, and REST APIs into a single, high-performance service built on [Elysia](https://elysiajs.com) and [Bun](https://bun.sh).

Unlike traditional BaaS solutions that rely on microservices, Bunvel runs as a single application, making it incredibly fast and easy to deploy.

## ✨ Features

- 🔐 **Authentication** - Complete auth system with JWT, social providers, and email/password
- 💾 **Storage** - File upload/download with bucket management and CDN integration
- ⚡ **Realtime** - WebSocket subscriptions for live data updates
- 🔌 **REST API** - Auto-generated REST APIs from your database schema
- 🎨 **Studio** - Beautiful admin dashboard built with TanStack Start
- 🚀 **Single Service** - Everything runs in one unified application for maximum performance

## 🏗️ Architecture

Bunvel consists of two main components:

- **Backend (`app/`)** - Elysia-based API server handling all services
- **Studio (`studio/`)** - TanStack Start admin dashboard for management

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.5
- PostgreSQL >= 18

### Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bunvel.git
cd bunvel
```

2. **Start with Docker Compose (Recommended)**

```bash
docker-compose up -d
```


The backend will be available at `http://localhost:3000` and the studio at `http://localhost:3001`.

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Development Guide](./docs/development.md)

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

## 🔒 Security

Please review our [Security Policy](./SECURITY.md) for reporting vulnerabilities.

## 📝 License

Bunvel is licensed under the [Apache License 2.0](./LICENSE).

## 🌟 Inspiration

Bunvel is inspired by [Supabase](https://supabase.com) but takes a different architectural approach by consolidating all services into a single, unified application for improved performance and simpler deployment.

## 💬 Community

- [GitHub Discussions](https://github.com/yourusername/bunvel/discussions)
- [Discord](https://discord.gg/bunvel) *(coming soon)*
- [Twitter](https://twitter.com/bunvel) *(coming soon)*

---

Built with ❤️ using [Bun](https://bun.sh), [Elysia](https://elysiajs.com), and [TanStack Start](https://tanstack.com/start)
