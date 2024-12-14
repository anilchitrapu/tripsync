# TripSync

TripSync is a web application that helps groups coordinate their travel schedules easily. Users can create events, share them with others, and track everyone's arrival and departure times in one place.

## Features

- 📅 Create and manage events with date ranges
- 👥 Share events with other users
- ✈️ Track arrival and departure schedules
- 🔐 Secure authentication with Firebase
- 📱 Responsive design for mobile and desktop

## Tech Stack

- React (with Vite)
- Firebase (Authentication & Firestore)
- TailwindCSS
- React Router
- Zustand (State Management)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/anilchitrapu/tripsync.git
cd tripsync/client
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```
Then edit `.env` with your Firebase configuration values.

4. Start the development server

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Development

To start the development server:

```bash
npm run dev
```

## Deployment

To build and deploy the application:

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Anil Chitrapu - [@anilchitrapu](https://github.com/anilchitrapu)
