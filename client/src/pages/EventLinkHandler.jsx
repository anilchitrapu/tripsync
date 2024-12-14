import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../utils/firebaseConfig';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function EventLinkHandler() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [travelMethod, setTravelMethod] = useState('flight');
  const [travelInfo, setTravelInfo] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvent(docSnap.data());
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Unable to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'attendance'), {
        eventId,
        userId: user.uid,
        name: user.displayName || user.email.split('@')[0],
        isHost: false,
        arrivalDate,
        departureDate,
        travelDetails: {
          arrivalMethod: travelMethod,
          departureMethod: travelMethod,
          arrivalInfo: travelInfo,
          departureInfo: travelInfo
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Handle success (redirect or show message)
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setError('Failed to submit attendance');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="form-container">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="form-container">
        <div className="text-red-500">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="form-container">
        <h2 className="text-3xl font-bold text-center mb-8">{event.eventName}</h2>
        {event.acceptingSubmissions ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Arrival Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                min={event.startDate}
                max={event.endDate}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Departure Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={event.startDate}
                max={event.endDate}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Travel Method</label>
              <select 
                className="form-input"
                value={travelMethod}
                onChange={(e) => setTravelMethod(e.target.value)}
              >
                <option value="flight">Flight</option>
                <option value="drive">Drive</option>
                <option value="train">Train</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Travel Details (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={travelInfo}
                onChange={(e) => setTravelInfo(e.target.value)}
                placeholder="Flight number, etc."
              />
            </div>

            <button type="submit" className="button button-primary">
              Submit
            </button>
          </form>
        ) : (
          <div className="text-center text-gray-600">
            <p>Sorry, this event is not accepting submissions at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventLinkHandler;