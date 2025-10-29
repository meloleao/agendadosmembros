import { Member, EventType } from './types';

export const MEMBERS: Member[] = [
  { id: '1', name: 'Conselheiro Kennedy Barros' },
  { id: '2', name: 'Conselheira Lilian Martins' },
  { id: '3', name: 'Conselheiro Olavo Rebelo' },
  { id: '4', name: 'Conselheira Flora Izabel' },
  { id: '5', name: 'Conselheiro Abelardo Vilanova' },
  { id: '6', name: 'Conselheiro Kleber Eulálio' },
  { id: '7', name: 'Conselheiro Alisson Felipe' },
  { id: '8', name: 'Conselheiro Substituto Jaylson Campelo' },
  { id: '9', name: 'Conselheiro Substituto Delano Câmara' },
  { id: '10', name: 'Conselheiro Substituto Almoço Júnior' },
  { id: '11', name: 'Conselheira Substituta Jackson Veras' },
  { id: '12', name: 'Procurador-Geral Leandro Maciel' },
  { id: '13', name: 'Procurador Márcio André' },
  { id: '14', name: 'Procuradora Raïssa Rezende' },
  { id: '15', name: 'Procurador Pinheiro Júnior' },
  { id: '16', name: 'Procurador Diogo Telles' },
];

export const EVENT_TYPE_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  [EventType.REUNIAO]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
  [EventType.AUDIENCIA]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
  [EventType.COMPROMISSO_EXTERNO]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
  [EventType.DESPACHO_INTERNO]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  [EventType.SESSAO]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
  [EventType.OUTRO]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
};
