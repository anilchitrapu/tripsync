# TripSync

TripSync is a web application that helps groups coordinate their travel schedules easily. Users can create events, share them with others, and track everyone's arrival and departure times in one place.

## Features

- 📅 Create and manage events with date ranges
- 👥 Share events with other users
- ✈️ Track arrival and departure schedules
- 🔐 Secure authentication with Firebase
- 📱 Responsive design with dark mode support
- 🔄 Real-time updates
- 🌐 Offline support with Firestore persistence

## Tech Stack

- React 18 (with Vite)
- Firebase
  - Authentication
  - Firestore with offline persistence
  - Analytics
- TailwindCSS with dark mode
- React Router v6
- ESLint with React plugins

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/anilchitrapu/tripsync.git
cd tripsync/client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the client directory with the following variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
client/
├── src/
│   ├── components/     # Reusable components
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   ├── styles/        # Global styles and Tailwind config
│   ├── utils/         # Utility functions and Firebase config
│   └── main.jsx       # Application entry point
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Anil Chitrapu - [@anilchitrapu](https://github.com/anilchitrapu)