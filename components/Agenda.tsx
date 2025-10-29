import React, { useState, useMemo } from 'react';
import { Member, Event } from '../types';
import { EVENT_TYPE_COLORS } from '../constants';
import EventModal from './EventModal';
import ShareModal from './ShareModal';
import ReportModal from './ReportModal';
import { User } from '@supabase/supabase-js';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface AgendaProps {
  user: User;
  member: Member;
  events: Event[];
  onLogout: () => void;
  onSaveEvents: (events: Event[]) => Promise<string | null>;
  onDeleteEvent: (eventId: string) => void;
}

const Agenda: React.FC<AgendaProps> = ({ user, member, events, onLogout, onSaveEvents, onDeleteEvent }) => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [shareContent, setShareContent] = useState({ title: '', text: '' });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach(event => {
      const start = new Date(event.date + 'T00:00:00');
      const end = event.endDate ? new Date(event.endDate + 'T00:00:00') : start;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!map.has(dateStr)) {
              map.set(dateStr, []);
          }
          map.get(dateStr)!.push(event);
      }
    });
    return map;
  }, [events]);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayEvents = eventsByDate.get(dateStr) || [];
    const isSelected = dateStr === selectedDate;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    calendarDays.push(
      <div 
        key={day} 
        className={`p-2 border border-gray-200 rounded-md cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-tce-pi-blue bg-opacity-20 border-tce-pi-blue' : 'hover:bg-gray-100'}`}
        onClick={() => setSelectedDate(dateStr)}
      >
        <div className={`text-right text-sm ${isToday ? 'text-tce-pi-green font-bold' : 'text-gray-700'}`}>{day}</div>
        <div className="mt-1 space-y-1 h-16 overflow-y-auto">
          {dayEvents.slice(0, 2).map(event => {
            const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.default;
            return(
            <div key={event.id} className={`text-xs p-1 rounded-md ${colors.bg} ${colors.text} truncate`}>
                {event.title}
            </div>
          )})}
          {dayEvents.length > 2 && <div className="text-xs text-gray-500 mt-1">+{dayEvents.length - 2} mais</div>}
        </div>
      </div>
    );
  }

  const selectedDayEvents = (eventsByDate.get(selectedDate) || []).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handleAddEvent = () => {
    setEventToEdit(null);
    setIsEventModalOpen(true);
  };
  
  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setIsEventModalOpen(true);
  };
  
  const handleDeleteEvent = (eventId: string) => {
      if (window.confirm("Tem certeza que deseja excluir este compromisso?")) {
          onDeleteEvent(eventId);
      }
  }
  
  const handleShareAgenda = () => {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    
    const upcomingEvents = events
        .filter(event => {
            const eventDate = new Date(event.date + 'T12:00:00');
            return eventDate >= today && eventDate <= endOfWeek;
        })
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    let summary = `*Agenda de ${member.name} para os próximos 7 dias:*\n\n`;
    if (upcomingEvents.length === 0) {
        summary += "Nenhum compromisso agendado.";
    } else {
        upcomingEvents.forEach(event => {
            const eventDate = new Date(event.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
            summary += `*${eventDate}*\n`;
            if (event.endDate) {
                 summary += ` - ${event.title} (de ${new Date(event.date+'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(event.endDate+'T12:00:00').toLocaleDateString('pt-BR')})\n`;
            } else {
                 summary += ` - ${event.startTime}: ${event.title} (${event.type})\n`;
            }
            if (event.location) {
                summary += `   Local: ${event.location}\n`;
            }
        });
    }
    setShareContent({ title: "Compartilhar Agenda da Semana", text: summary });
    setIsShareModalOpen(true);
  };

  const handleShareReport = (title: string, text: string) => {
    setShareContent({ title, text });
    setIsReportModalOpen(false); // Close the report modal
    setIsShareModalOpen(true); // Open the share modal
  };
  
  const getEventColorClasses = (type: string) => {
    return EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS['default'];
  };
  
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-tce-pi-green">Agenda de {member.name}</h1>
          <p className="text-gray-600 text-sm md:text-base">Bem-vindo(a), {user.email}!</p>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto">Sair</button>
      </header>

      <main className="p-4 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-2">
          <button onClick={handleAddEvent} className="px-4 py-2 bg-tce-pi-green text-white rounded-md hover:bg-tce-pi-green-dark transition-colors">Novo Compromisso</button>
          <button onClick={handleShareAgenda} className="px-4 py-2 bg-tce-pi-blue text-white rounded-md hover:bg-opacity-90 transition-colors">Compartilhar Agenda</button>
          <button onClick={() => setIsReportModalOpen(true)} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors">Gerar Relatório</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-center">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={goToToday} className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">Hoje</button>
              </div>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 text-xs sm:text-base border-b pb-2">
              {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2 mt-2">
              {calendarDays}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">
              Compromissos para {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </h3>
            {selectedDayEvents.length > 0 ? (
              <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {selectedDayEvents.map(event => {
                  const colors = getEventColorClasses(event.type);
                  const isMultiDayEvent = !!event.endDate;
                  const canEdit = user.id === event.user_id;
                  return (
                    <li key={event.id} className={`p-3 rounded-lg border-l-4 ${colors.border} bg-gray-50`}>
                      <div className={`px-2 py-0.5 text-xs inline-block rounded-full mb-1 ${colors.bg} ${colors.text}`}>
                        {event.type}
                      </div>
                      <p className="font-bold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {isMultiDayEvent 
                            ? `${new Date(event.date+'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(event.endDate!+'T12:00:00').toLocaleDateString('pt-BR')}` 
                            : `${event.startTime} - ${event.endTime}`
                        }
                      </p>
                       {event.location && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </p>
                      )}
                      {event.description && <p className="text-sm mt-1 text-gray-800 whitespace-pre-wrap">{event.description}</p>}
                      {canEdit && (
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => handleEditEvent(event)} className="text-xs text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDeleteEvent(event.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mt-8">Nenhum compromisso para este dia.</p>
            )}
          </div>
        </div>
      </main>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={onSaveEvents}
        member={member}
        existingEvents={events}
        eventToEdit={eventToEdit}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={shareContent.title}
        textToShare={shareContent.text}
      />
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        member={member}
        events={events}
        onShare={handleShareReport}
      />
    </div>
  );
};

export default Agenda;