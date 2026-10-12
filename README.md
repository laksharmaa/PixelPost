# PixelPost
![Thumbnail](https://github.com/user-attachments/assets/b63814ec-3055-4bd1-8464-336617d47be1)
<img width="960" alt="image" src="https://github.com/user-attachments/assets/702ea664-d709-4f9b-9635-9068c3db45bc" />

> PixelPost is a community platform where users can create, share, and explore AI-generated images. The application uses React, Node.js, Express, a MongoDB-compatible database, and Cloudinary for image storage. Authentication and authorization are handled using Auth0.

## Features

> - AI-generated images from Stability AI👾
> - User authentication with Auth0🔑
> - Personalized user profiles👤
> - Like and comment on posts👍🏻
> - Dark mode support🌗
> - Image storage and management with Cloudinary📷
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
**MongoDB-compatible database**: For data storage
**Cloudinary**: For image storage
**Auth0**: For authentication and authorization

## Setup
### Prerequisites
- Node.js (v18 or higher)
- npm (v7 or higher)
- Cloudinary account
- Auth0 account
- MongoDB-compatible database account

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
VITE_AUTH0_AUDIENCE=your-auth0-audience
VITE_BASE_URL=http://localhost:8080
```

### *SERVER*
```
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience
ADMIN_JWT_SECRET=your-admin-jwt-secret
MONGODB_URI=your-mongodb-compatible-connection-string
PORT=8080
CLIENT_URL=http://localhost:5173
│   │   ├── notificationRoutes.js
│   │   ├── postRouter.js
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STABILITY_API_KEY=your-stability-api-key
```

`STORAGE_PROVIDER` defaults to `cloudinary`.

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
│   ├── middleware/
│   ├── package.json
│   ├── controllers/
│   ├── routes/
│   │   ├── adminRouter.js
│   │   ├── contestRouter.js
│   │   ├── dalleRouter.js
│   │   ├── notificationRoutes.js
│   │   ├── postRouter.js
│   │   ├── userRoutes.js
│   ├── services/
│   │   ├── adminService.js
│   │   ├── contestService.js
│   │   ├── imageGenerationService.js
│   │   ├── notificationService.js
│   │   ├── postService.js
│   │   ├── storageService.js
│   │   ├── userService.js
│   ├── storage/
│   │   ├── cloudinaryStorage.js
│   ├── utils/
│   │   ├── loginOrCreateUser.js
│   └── vercel.json
```

## Contributing
> Contributions are welcome! Please submit a pull request for any changes. Lets make it *Creative*😎

# **Built with sleepless nights☕**
