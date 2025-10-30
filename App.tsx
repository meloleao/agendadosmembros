import React, { useState, useEffect } from 'react';
import { Event, Member, Profile } from './types';
import { MEMBERS } from './constants';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Agenda from './components/Agenda';
import { supabase } from './integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Helper to convert between database snake_case and JS camelCase
const dbEventToAppEvent = (dbEvent: any): Event => ({
  id: dbEvent.id,
  memberId: dbEvent.member_id,
  title: dbEvent.title,
  date: dbEvent.date,
  endDate: dbEvent.end_date || '',
  startTime: dbEvent.start_time,
  endTime: dbEvent.end_time,
  type: dbEvent.type,
  location: dbEvent.location || '',
  description: dbEvent.description || '',
  user_id: dbEvent.user_id,
});

const appEventToDbEvent = (appEvent: Event, userId: string, memberId: string) => ({
  id: appEvent.id.length > 20 ? appEvent.id : undefined, // Use existing ID for updates, let db generate for new
  user_id: userId,
  member_id: memberId,
  title: appEvent.title,
  date: appEvent.date,
  end_date: appEvent.endDate || null,
  start_time: appEvent.startTime,
  end_time: appEvent.endTime,
  type: appEvent.type,
  location: appEvent.location,
  description: appEvent.description,
});


const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProfileAndEvents = async () => {
      if (session?.user) {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfile(null);
          setEvents([]);
        } else if (profileData) {
          setProfile(profileData);
          // Fetch events for the member associated with the profile
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('member_id', profileData.member_id);
          
          if (eventsError) {
            console.error('Error fetching events:', eventsError);
            setEvents([]);
          } else {
            setEvents(eventsData.map(dbEventToAppEvent));
          }
        }
      } else {
        setProfile(null);
        setEvents([]);
      }
    };

    fetchProfileAndEvents();
  }, [session]);

  const handleLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignUp = async (email, password, memberId) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          member_id: memberId,
        },
      },
    });
    if (error) throw error;
    // The onAuthStateChange will handle setting the session
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const addEvents = async (eventsToAdd: Event[]): Promise<string | null> => {
    if (!session?.user || !profile) return "Usuário não autenticado.";
    
    const newEvent = eventsToAdd[0];

    // --- Conflict Check ---
    const isEditing = newEvent.id.length > 20;

    let query = supabase
      .from('events')
      .select('id, date, end_date, start_time, end_time, title')
      .eq('member_id', profile.member_id);

    // If we are editing an event, exclude it from the conflict check
    if (isEditing) {
      query = query.neq('id', newEvent.id);
    }

    const { data: conflictingEvents, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching for conflict check:", fetchError);
      return "Erro ao verificar conflitos.";
    }

    const isNewEventMultiDay = !!newEvent.endDate;
    const newEventStartDateTime = isNewEventMultiDay 
        ? new Date(`${newEvent.date}T00:00:00`) 
        : new Date(`${newEvent.date}T${newEvent.startTime}`);
    
    const newEventEndDateTime = isNewEventMultiDay 
        ? new Date(`${newEvent.endDate}T23:59:59`) 
        : new Date(`${newEvent.date}T${newEvent.endTime}`);

    for (const existingEvent of conflictingEvents) {
        const isExistingEventMultiDay = !!existingEvent.end_date;
        
        const existingStartDateTime = isExistingEventMultiDay
            ? new Date(`${existingEvent.date}T00:00:00`)
            : new Date(`${existingEvent.date}T${existingEvent.start_time}`);

        const existingEndDateTime = isExistingEventMultiDay
            ? new Date(`${existingEvent.end_date}T23:59:59`)
            : new Date(`${existingEvent.date}T${existingEvent.end_time}`);

        // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
        if (newEventStartDateTime < existingEndDateTime && newEventEndDateTime > existingStartDateTime) {
            const conflictedDate = new Date(existingEvent.date + 'T12:00:00').toLocaleDateString('pt-BR');
            return `Conflito de agendamento detectado com "${existingEvent.title}" em ${conflictedDate}.`;
        }
    }
    // --- End Conflict Check ---

    const dbEvent = appEventToDbEvent(newEvent, session.user.id, profile.member_id);
    
    const { data, error } = await supabase
      .from('events')
      .upsert(dbEvent)
      .select()
      .single();

    if (error) {
      console.error("Error saving event:", error);
      return "Não foi possível salvar o evento.";
    }

    const savedEvent = dbEventToAppEvent(data);
    const filteredEvents = events.filter(event => event.id !== savedEvent.id);
    setEvents([...filteredEvents, savedEvent]);
    return null;
  };
  
  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      console.error("Error deleting event:", error);
    } else {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  if (loading) {
    return <div className="bg-gray-100 min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session || !profile) {
    if (view === 'login') {
      return <Login onLogin={handleLogin} onNavigateToSignUp={() => setView('signup')} />;
    }
    return <SignUp onSignUp={handleSignUp} onNavigateToLogin={() => setView('login')} members={MEMBERS} />;
  }

  const memberForCurrentUser = MEMBERS.find(m => m.id === profile.member_id);

  if (!memberForCurrentUser) {
      return <div className="bg-gray-100 min-h-screen flex items-center justify-center">Erro: Membro associado não encontrado.</div>;
  }

  return (
    <Agenda
      user={session.user}
      member={memberForCurrentUser}
      events={events}
      onLogout={handleLogout}
      onSaveEvents={addEvents}
      onDeleteEvent={deleteEvent}
    />
  );
};

export default App;