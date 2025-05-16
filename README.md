# Fuel The Feed - Backend

A Fastify-based backend service for the Fuel The Feed platform, deployed on Vercel. This service handles campaign management, user authentication, and creator applications.

## Features

- Campaign Management API
  - CRUD operations for campaigns
  - Campaign brief generation
  - Campaign status tracking
  - Budget management

- User Management
  - User authentication
  - Wallet-based identity
  - User profile management

- Creator Applications
  - Application submission
  - Application status tracking
  - Creator-campaign matching

## Tech Stack

- Fastify
- MongoDB
- Vercel Serverless Functions
- JWT Authentication
- Axios

## Getting Started

1. Install dependencies:
```bash
cd fastify-serverless-function
npm install
```

2. Set up environment variables:
Create a `.env` file with the following variables:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Users
- `GET /api/users/:walletId` - Get user by wallet ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user profile

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/campaign/:campaignId` - Get applications for campaign
- `PUT /api/applications/:id/status` - Update application status

## Project Structure

```
fastify-serverless-function/
├── api/              # API routes
├── models/           # Database models
├── services/         # Business logic
└── utils/           # Utility functions
```

## Deployment

The backend is deployed on Vercel using serverless functions. The deployment is automatically triggered when changes are pushed to the main branch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 