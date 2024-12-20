# PixelPost
![Thumbnail](https://github.com/user-attachments/assets/b63814ec-3055-4bd1-8464-336617d47be1)

> PixelPost is a Community Platform that where users can create, share, and explore AI-generated images. The application uses React for the client-side, Node.js and Express for the server-side, Azure CosmosDB for data storage, and Azure Blob Storage for image storage. Authentication and authorization are handled using Auth0.

## Features

> - AI-generated image creation using OpenAI's API👾
> - User authentication with Auth0🔑
> - Personalized user profiles👤
> - Like and comment on posts👍🏻
> - Dark mode support🌗
> - Image storage and management with Azure Blob Storage📷
> - Community showcase for sharing and exploring images🖼
> - Responsive UI for a seamless experience on all devices📲

## Tech Stack
### Client-Side
**React**: For building the user interface
**Tailwind CSS**: For styling
**Auth0**: For authentication and authorization
### Server-Side
**Node.js**: For server-side JavaScript
**Express**: For building the API
**CosmosDB**: For data storage
**Azure Blob Storage**: For image storage
**Auth0**: For authentication and authorization

## Setup
### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Azure account (for Blob Storage)
- Auth0 account
- CosmosDB account

### Installation
1. Clone the repository:
```
git clone https://github.com/your-username/pixelpost.git
cd pixelpost
```
2. Install dependencies for both client and server:
```# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```
## Environment Variables
> Create a .env file in both the client and server directories and add the following environment variables:
### *CLIENT*
```
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_CLIENT_SECRET=your-auth0-client-secret
VITE_AUTH0_AUDIENCE=your-auth0-audience
VITE_BASE_URL=http://localhost:8080
```

### *SERVER*
```
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience
AZURE_BLOB_CONNECTION_STRING=your-azure-blob-connection-string
AZURE_CONTAINER_NAME=your-azure-container-name
COSMOSDB_URL=your-cosmosdb-url
OPENAI_API_KEY=your-openai-api-key
```

## Run the Application
*Client*
```
cd client
npm run dev
```
*Server*
```
cd server
npm start
```
## Folder Structure
```
pixelpost/
├── client/
│   ├── .env
│   ├── .eslintrc.cjs
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   ├── README.md
│   ├── src/
│   │   ├── App.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constant/
│   │   ├── context/
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── Pages/
│   │   ├── utils/
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
├── server/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── mongodb/
│   │   ├── connect.js
│   │   ├── models/
│   ├── package.json
│   ├── routes/
│   │   ├── dalleRoutes.js
│   │   ├── postRoutes.js
│   ├── services/
│   │   ├── azureBlobService.js
│   ├── utils/
│   │   ├── loginOrCreateUser.js
│   └── vercel.json
```

## Contributing
> Contributions are welcome! Please submit a pull request for any changes. Lets make it *Creative*😎

# **Built with sleepless nights☕**
