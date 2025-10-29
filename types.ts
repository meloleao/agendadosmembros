// FIX: Define and export all necessary types for the application.
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
  memberId: string;
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: EventType;
  location: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  memberId: string;
}
