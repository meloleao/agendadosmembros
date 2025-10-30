import React, { useState, useEffect } from 'react';
import { Event, Member, EventType } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (events: Event[]) => Promise<string | null>;
  member: Member;
  existingEvents: Event[];
  eventToEdit: Event | null;
}

const initialFormData: Omit<Event, 'id' | 'memberId'> = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  endDate: '',
  startTime: '09:00',
  endTime: '10:00',
  type: EventType.REUNIAO,
  location: '',
  description: '',
};

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, member, eventToEdit }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setFormData({
          title: eventToEdit.title,
          date: eventToEdit.date,
          endDate: eventToEdit.endDate || '',
          startTime: eventToEdit.startTime,
          endTime: eventToEdit.endTime,
          type: eventToEdit.type,
          location: eventToEdit.location || '',
          description: eventToEdit.description,
        });
        setIsMultiDay(!!eventToEdit.endDate);
      } else {
        setFormData(initialFormData);
        setIsMultiDay(false);
      }
      setError('');
    }
  }, [isOpen, eventToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.date || !formData.type) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isMultiDay && formData.startTime >= formData.endTime) {
        setError("A hora de início deve ser anterior à hora de término.");
        return;
    }
    
    if (isMultiDay && !formData.endDate) {
        setError("Por favor, selecione uma data final para o evento de múltiplos dias.");
        return;
    }
    
    if (isMultiDay && formData.date > formData.endDate!) {
        setError("A data de início deve ser anterior ou igual à data de término.");
        return;
    }

    setIsSaving(true);
    const newOrUpdatedEvent: Event = {
        ...formData,
        id: eventToEdit ? eventToEdit.id : Date.now().toString(), // A temporary ID for new events
        memberId: member.id,
        endDate: isMultiDay ? formData.endDate : '',
        startTime: isMultiDay ? '00:00' : formData.startTime,
        endTime: isMultiDay ? '23:59' : formData.endTime,
    };

    const conflictError = await onSave([newOrUpdatedEvent]);

    if (conflictError) {
      setError(conflictError);
    } else {
      onClose();
    }
    setIsSaving(false);
  };


  if (!isOpen) return null;

  const inputStyle = "shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-tce-pi-blue";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-tce-pi-green">{eventToEdit ? 'Editar Compromisso' : 'Novo Compromisso'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="title">Título</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} required className={inputStyle} disabled={isSaving} />
          </div>
          
           <div>
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="type">Tipo</label>
            <select name="type" id="type" value={formData.type} onChange={handleInputChange} required className={inputStyle} disabled={isSaving}>
              {Object.values(EventType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
           <div>
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="location">Local</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleInputChange} className={inputStyle} placeholder="Ex: Sala de Reuniões 1" disabled={isSaving} />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="description">Descrição</label>
            <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleInputChange} className={inputStyle} disabled={isSaving} />
          </div>
          
           <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isMultiDay"
                    name="isMultiDay"
                    checked={isMultiDay}
                    onChange={(e) => setIsMultiDay(e.target.checked)}
                    className="h-4 w-4 text-tce-pi-blue focus:ring-tce-pi-blue border-gray-300 rounded"
                    disabled={isSaving}
                />
                <label htmlFor="isMultiDay" className="ml-2 block text-sm text-gray-900">
                    Evento de múltiplos dias
                </label>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="date">Data de Início</label>
                      <input type="date" name="date" id="date" value={formData.date} onChange={handleInputChange} required className={inputStyle} disabled={isSaving} />
                  </div>
                  {isMultiDay && (
                      <div>
                          <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="endDate">Data de Fim</label>
                          <input type="date" name="endDate" id="endDate" value={formData.endDate || ''} onChange={handleInputChange} required={isMultiDay} className={inputStyle} disabled={isSaving} />
                      </div>
                  )}
              </div>
              {!isMultiDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                          <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="startTime">Início</label>
                          <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleInputChange} required className={inputStyle} disabled={isSaving} />
                      </div>
                      <div>
                          <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="endTime">Término</label>
                          <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleInputChange} required className={inputStyle} disabled={isSaving} />
                      </div>
                  </div>
              )}
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-tce-pi-green text-white rounded-md hover:bg-tce-pi-green-dark disabled:bg-gray-400" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Compromisso'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EventModal;