import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import EventLinkHandler from "./pages/EventLinkHandler";
import AccountSettings from "./pages/AccountSettings";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/navigation/Navbar";
import { useAuth } from "./context/AuthContext";

function App() {
    const { user } = useAuth();

    return (
        <BrowserRouter
            future={{ 
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-16">
                    <Routes>
                        <Route 
                            path="/" 
                            element={user ? <HomePage /> : <Navigate to="/auth" />} 
                        />
                        <Route path="/event/:eventId" element={<EventDetails />} />
                        <Route path="/create-event" element={<CreateEvent />} />
                        <Route path="/join/:eventId" element={<EventLinkHandler />} />
                        <Route 
                            path="/account-settings" 
                            element={user ? <AccountSettings /> : <Navigate to="/auth" />}
                        />
                        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;