# MERN Notes Application - Backend

A robust backend server for the MERN Notes application, built with TypeScript, Express.js, and MongoDB. This server provides RESTful APIs for user authentication and note management.

## 🚀 Features

- User authentication (signup, login, logout)
- JWT-based authentication
- Note CRUD operations
- MongoDB database integration
- TypeScript support
- Environment variable configuration
- Error handling middleware
- Request logging with Morgan
- CORS enabled
- ESLint for code quality

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Environment Variables:** dotenv, envalid
- **Logging:** Morgan
- **Development:** Nodemon, ts-node

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notes-mern-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📁 Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── types/          # TypeScript type definitions
└── server.ts       # Application entry point
```

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Notes
- `GET /api/notes` - Get all notes for authenticated user
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## 🧪 Testing

```bash
npm test
```

## 📝 Code Quality

Run ESLint to check code quality:
```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- All contributors who have helped shape this project 