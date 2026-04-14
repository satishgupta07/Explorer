# Explorer — Social Media Web App

A full-stack social media platform where users can share posts with images, like and comment on content, follow other users, and check live weather — all in a responsive three-column feed layout.

**Live server:** https://explorer-server.onrender.com

**Test credentials:**
- Email: `user@dev.in`
- Password: `user`

---

## Features

| Feature | Details |
|---------|---------|
| Authentication | Register with avatar upload, JWT login/logout, refresh token rotation |
| Posts | Create (image + caption), view global feed, view own posts, delete own posts |
| Likes | Toggle like/unlike per post with live count updates |
| Comments | Add comments to any post; view comment thread inline |
| Profiles | Own profile with post/follower/following stats; view other users' profiles |
| Follow / Unfollow | Follow or unfollow any user; counts update in real time |
| Weather widget | Search any city via OpenWeatherMap API |
| Trending hashtags | Sidebar with popular tags (static, extendable) |
| Responsive layout | Mobile-first; three-column grid on desktop |

---

## Tech Stack

### Frontend (`explorerClient/`)
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework and build tool |
| React Router DOM 6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Headless UI + Heroicons | Accessible navbar and dropdown components |
| Axios | HTTP client for auth service calls |
| Cloudinary (direct upload) | Browser-side image uploads for posts and avatars |
| Moment.js | Relative timestamps ("2 hours ago") |
| SweetAlert2 | Toast notifications for login / register success/errors |

### Backend (`explorerServer/`)
| Tool | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JWT (jsonwebtoken) | Access + refresh token authentication |
| bcrypt | Password hashing |
| Multer | Multipart file handling for avatar uploads |
| Cloudinary SDK | Server-side avatar upload (register flow) |
| Joi | Request body validation |
| cookie-parser | Read JWT tokens from cookies |
| mongoose-aggregate-paginate-v2 | Pagination support for posts |

---

## Project Structure

```
Explorer/
├── explorerClient/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Posts/       # CreatePost, PostCard, Comment
│   │   │   ├── Weather/     # Weather widget + WeatherData
│   │   │   ├── Tags/        # Trending hashtags sidebar
│   │   │   ├── AuthLayout   # Route protection wrapper
│   │   │   ├── Navbar       # Sticky top navigation
│   │   │   └── Profile      # User avatar dropdown menu
│   │   ├── contexts/
│   │   │   ├── AuthContext  # Global user + token state
│   │   │   └── PostContext  # Global posts array state
│   │   ├── pages/
│   │   │   ├── Home         # Three-column feed layout
│   │   │   ├── Login        # Sign-in form
│   │   │   ├── Register     # Sign-up form with avatar upload
│   │   │   ├── ProfilePage  # Current user's profile + posts
│   │   │   └── UserProfile  # Another user's profile + follow toggle
│   │   ├── services/
│   │   │   └── auth.js      # Axios wrappers for register / login
│   │   └── config/
│   │       └── conf.js      # Env variable config object
│   ├── .env                 # Frontend environment variables (see below)
│   └── vite.config.js
│
└── explorerServer/          # Express backend
    ├── src/
    │   ├── controllers/
    │   │   ├── user.controller.js     # Register, login, logout, token refresh
    │   │   ├── post.controller.js     # Create, read, delete posts
    │   │   ├── comment.controller.js  # Add comments
    │   │   ├── like.controller.js     # Like / unlike toggle
    │   │   └── profile.controller.js  # User profiles, follow/unfollow
    │   ├── routes/
    │   │   ├── user.route.js
    │   │   ├── post.route.js
    │   │   └── comment.route.js
    │   ├── models/
    │   │   ├── user.model.js    # User schema with bcrypt hooks + JWT methods
    │   │   ├── post.model.js    # Post schema with pagination plugin
    │   │   ├── comment.model.js
    │   │   └── like.model.js
    │   ├── middlewares/
    │   │   ├── auth.middleware.js    # JWT verification (verifyJWT)
    │   │   └── multer.middleware.js  # Local file storage for uploads
    │   ├── utils/
    │   │   ├── ApiError.js       # Custom HTTP error class
    │   │   ├── ApiResponse.js    # Standardised success response shape
    │   │   ├── asyncHandler.js   # Async error forwarding wrapper
    │   │   └── cloudinary.js     # Upload + cleanup utility
    │   ├── db/index.js           # MongoDB connection
    │   ├── app.js                # Express app + middleware + route mounting
    │   └── server.js             # Entry point: DB connect → listen
    └── .env                      # Backend environment variables (see below)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- OpenWeatherMap API key

### 1. Clone the repository

```bash
git clone https://github.com/satishgupta07/Explorer.git
cd Explorer
```

### 2. Configure the backend

Create `explorerServer/.env`:

```env
PORT=3333
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER_NAME=Explorer

CORS_ORIGIN=http://localhost:5173
```

### 3. Configure the frontend

Create `explorerClient/.env`:

```env
VITE_SERVER_URI=http://localhost:3333/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

> The `VITE_CLOUDINARY_UPLOAD_PRESET` must be an **unsigned** upload preset configured in your Cloudinary dashboard, used for direct browser uploads of post images.

### 4. Install dependencies and run

```bash
# Backend
cd explorerServer
npm install
npm run dev       # or: node src/server.js

# Frontend (in a new terminal)
cd explorerClient
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3333`.

---

## API Reference

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Users — `/api/v1/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register a new user (`multipart/form-data` with `avatar` file) |
| POST | `/login` | No | Log in; returns access + refresh tokens |
| POST | `/logout` | Yes | Log out; clears tokens and cookies |
| POST | `/refresh-token` | No | Refresh the access token using a valid refresh token |
| GET | `/current-user` | Yes | Get the currently authenticated user |
| GET | `/profile/:userId` | Yes | Get a user's profile, posts, followers, and following |
| POST | `/follow-user/:userId` | Yes | Toggle follow / unfollow |

### Posts — `/api/v1/posts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | Get all posts with like/comment data |
| POST | `/create-post` | Yes | Create a new post (`title` + Cloudinary `image` URL) |
| GET | `/myposts` | Yes | Get the current user's posts |
| DELETE | `/deletepost/:postId` | Yes | Delete own post |
| POST | `/post/:postId` | Yes | Toggle like / unlike |

### Comments — `/api/v1/comments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/post/:postId` | Yes | Add a comment to a post |

---

## Authentication Flow

```
Register → bcrypt hash password → upload avatar to Cloudinary → create User in MongoDB
Login    → verify password → generate JWT access + refresh tokens → set cookies + return in JSON body
Request  → verifyJWT middleware reads token from cookie or Authorization header
           → decode → fetch user from DB → attach to req.user
Logout   → remove refreshToken from DB → clear cookies
```

---

## Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | |
| email | String | unique |
| avatar | String | Cloudinary URL |
| password | String | bcrypt hashed |
| followers | [ObjectId] | ref: User |
| following | [ObjectId] | ref: User |
| refreshToken | String | cleared on logout |

### Post
| Field | Type | Notes |
|-------|------|-------|
| title | String | post caption |
| image | String | Cloudinary URL |
| postedBy | ObjectId | ref: User |

### Comment
| Field | Type | Notes |
|-------|------|-------|
| content | String | |
| postId | ObjectId | ref: Post |
| author | ObjectId | ref: User |

### SocialLike
| Field | Type | Notes |
|-------|------|-------|
| postId | ObjectId | ref: Post |
| likedBy | ObjectId | ref: User |

---

## Key Design Decisions

- **Direct Cloudinary upload for posts:** Post images are uploaded from the browser directly to Cloudinary (using an unsigned preset), and only the resulting URL is sent to the backend. This avoids large binary payloads hitting the Node.js server for every post.
- **Server-side Cloudinary upload for avatars:** Avatars are uploaded via the server during registration (using Multer + Cloudinary SDK) because it runs as part of the form validation / user-creation transaction.
- **Dual token delivery:** Access and refresh tokens are sent as both `httpOnly` cookies (XSS-safe for browsers) and in the JSON body (usable by mobile/API clients without cookie support).
- **asyncHandler utility:** All async Express controllers are wrapped in a higher-order function that forwards thrown errors to `next()`, removing boilerplate try/catch in every route.
- **PostContext for feed state:** Posts are stored in React context so that like, delete, and create actions update the feed instantly without re-fetching the entire list from the server.
