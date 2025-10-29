export interface Member {
  id: string;
  name: string;
}

export enum EventType {
  REUNIAO = 'Reunião',
  AUDIENCIA = 'Audiência',
  COMPROMISSO_EXTERNO = 'Compromisso Externo',
  DESPACHO_INTERNO = 'Despacho Interno',
  SESSAO = 'Sessão',
  OUTRO = 'Outro',
}

export interface Event {
  id: string;
  memberId: string; // Corresponds to member_id in DB
  title: string;
  date: string;
  endDate: string; // Corresponds to end_date in DB
  startTime: string; // Corresponds to start_time in DB
  endTime: string; // Corresponds to end_time in DB
  type: EventType;
  location: string;
  description: string;
  user_id?: string; // The user who created the event
}

// This represents the user profile stored in our public.profiles table
export interface Profile {
  id: string; // Corresponds to auth.users.id
  member_id: string;
  updated_at: string;
}