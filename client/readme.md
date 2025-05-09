# InterviewAI Pro - Frontend

This is the React.js frontend for the InterviewAI Pro application, which provides AI-powered mock interview preparation.

## Features

- Modern React application with functional components and hooks
- Clean UI with a light theme using Tailwind CSS
- Interactive interview practice with voice recognition
- Real-time feedback and analytics
- Session-based authentication
- Responsive design for all device sizes

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Framer Motion for animations
- Headless UI for accessible components
- Axios for API requests
- Lottie for vector animations
- React Toastify for notifications

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
/src
  /assets          # Static assets and animations
  /components      # Reusable components
  /contexts        # React Context providers
  /hooks           # Custom React hooks
  /pages           # Page components
  /services        # API services
  /utils           # Helper functions
  App.js           # Main component
  index.js         # Application entry point
  index.css        # Global styles
```

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App configuration