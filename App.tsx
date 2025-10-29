import React, { useState, useEffect } from 'react';
import { Event, Member, User } from './types';
import { MEMBERS } from './constants';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Agenda from './components/Agenda';

const App: React.FC = () => {
  // STATE MANAGEMENT
  const [view, setView] = useState<'login' | 'signup'>('login');
  
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('tce-pi-users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('tce-pi-currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('tce-pi-events');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  // PERSISTENCE
  useEffect(() => {
    localStorage.setItem('tce-pi-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tce-pi-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tce-pi-currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tce-pi-currentUser');
    }
  }, [currentUser]);

  // AUTHENTICATION HANDLERS
  const handleLogin = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleSignUp = (username, password, memberId) => {
    if (users.some(u => u.username === username)) {
      return false; // Username already exists
    }
    const newUser: User = { id: Date.now().toString(), username, password, memberId };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  // EVENT HANDLERS
  const addEvents = (eventsToAdd: Event[]): string | null => {
      // Assumes eventsToAdd contains a single event object to be added or updated.
      const newEvent = eventsToAdd[0];

      // Dates for the new event. For single-day events, endDate is the same as date.
      const newEventStart = new Date(newEvent.date + 'T00:00:00');
      const newEventEnd = new Date((newEvent.endDate || newEvent.date) + 'T00:00:00');

      for (const existingEvent of events) {
          // Skip self-comparison when editing
          if (existingEvent.id === newEvent.id) {
              continue;
          }

          // Only check events for the same member
          if (existingEvent.memberId !== newEvent.memberId) {
              continue;
          }

          const existingEventStart = new Date(existingEvent.date + 'T00:00:00');
          const existingEventEnd = new Date((existingEvent.endDate || existingEvent.date) + 'T00:00:00');

          // Check for date range overlap
          const datesOverlap = newEventStart <= existingEventEnd && existingEventStart <= newEventEnd;
          
          if (datesOverlap) {
              // If dates overlap, check for time overlap
              const timesOverlap = (newEvent.startTime < existingEvent.endTime && newEvent.endTime > existingEvent.startTime);
              
              if (timesOverlap) {
                  const conflictedDate = new Date(existingEvent.date + 'T00:00:00').toLocaleDateString('pt-BR');
                  return `Conflito de agendamento detectado com um evento em ${conflictedDate} entre ${existingEvent.startTime} e ${existingEvent.endTime}.`;
              }
          }
      }
      
      // No conflicts, proceed with save/update
      const filteredEvents = events.filter(event => event.id !== newEvent.id);
      setEvents([...filteredEvents, newEvent]);
      return null;
  };
  
  const deleteEvent = (eventId: string) => {
      setEvents(events.filter(event => event.id !== eventId));
  };

  // RENDER LOGIC
  if (!currentUser) {
    if (view === 'login') {
      return <Login onLogin={handleLogin} onNavigateToSignUp={() => setView('signup')} />;
    }
    return <SignUp onSignUp={handleSignUp} onNavigateToLogin={() => setView('login')} members={MEMBERS} />;
  }

  const memberForCurrentUser = MEMBERS.find(m => m.id === currentUser.memberId);
  const eventsForMember = events.filter(e => e.memberId === currentUser.memberId);

  return (
    <Agenda
      user={currentUser}
      member={memberForCurrentUser!}
      events={eventsForMember}
      onLogout={handleLogout}
      onSaveEvents={addEvents}
      onDeleteEvent={deleteEvent}
    />
  );
};

export default App;