# Social Media App Backend

A full-featured social media application backend built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- 🔐 **User Authentication** - JWT-based login/signup system
- 👤 **User Profiles** - Profile management with photo uploads
- 📝 **Posts** - Create posts with text, images, and videos
- ❤️ **Likes & Comments** - Interactive engagement system
- 👥 **Follow System** - Follow/unfollow other users
- 🔔 **Notifications** - Real-time notifications for interactions
- 🎯 **Smart Feed** - Hybrid algorithm for personalized content
- 📱 **File Uploads** - Support for images and videos
- 🍪 **Session Management** - Cookie-based authentication

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Template Engine**: EJS
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/SocialFold
   JWT_SECRET=your_secret_key_here
   ```

4. **Start MongoDB**
   - Local: Make sure MongoDB is running on your machine
   - Cloud: Use MongoDB Atlas or other cloud service

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /logout` - User logout

### User Management
- `GET /profile/:username` - Get user profile
- `POST /profile/update` - Update profile
- `POST /profile/photo` - Upload profile photo
- `POST /follow/:userId` - Follow/unfollow user

### Posts
- `GET /` - Get home feed
- `POST /post` - Create new post
- `POST /like/:postId` - Like/unlike post
- `GET /comments/:postId` - Get post comments
- `POST /comment/:postId` - Add comment

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `POST /notifications/:id/read` - Mark as read

## Database Schema

### Users
- name, username, email, password
- image (profile photo)
- followers, following arrays
- createdAt timestamp

### Posts
- title, content
- media (images/videos)
- likes, comments arrays
- user reference
- createdAt timestamp

### Comments
- content
- user reference
- post reference
- likes array
- createdAt timestamp

### Notifications
- type (follow, post, like, comment)
- sender, recipient references
- read status
- createdAt timestamp

## Deployment

### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Railway Deployment

1. **Connect to Railway**
   - Link your GitHub repository
   - Set environment variables in Railway dashboard

2. **Deploy automatically**
   - Railway will auto-deploy on git push

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/SocialFold |
| `JWT_SECRET` | JWT signing secret | required |
| `NODE_ENV` | Environment mode | development |

## File Structure

```
backend/
├── config/
│   └── DBConnect.js          # Database connection
├── controllers/
│   ├── homecontrollers.js    # Home feed logic
│   ├── logincontrollers.js   # Login logic
│   └── sigin_In_controolers.js # Signup logic
├── modules/
│   ├── user.js              # User model
│   ├── postmodule.js        # Post model
│   ├── commentmodule.js     # Comment model
│   └── notificationmodule.js # Notification model
├── routers/
│   ├── home.js              # Home routes
│   ├── login.js             # Auth routes
│   ├── post.js              # Post routes
│   └── notification.js      # Notification routes
├── Schema/
│   ├── post-Schema.js       # Post schema
│   └── SignIn-Schema.js     # User schema
├── utils/
│   └── isLogeedIn.js        # Auth middleware
├── views/
│   ├── home.ejs             # Home page
│   ├── login.ejs            # Login page
│   └── profile.ejs          # Profile page
├── public/
│   ├── uploads/             # Post media
│   ├── profile-photos/      # Profile photos
│   └── style/               # CSS files
├── main.js                  # Server entry point
└── package.json             # Dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@socialapp.com or create an issue in the repository. 