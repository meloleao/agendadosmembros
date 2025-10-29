import React, { useState, useEffect } from 'react';
import { Member, Event } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  events: Event[];
  onShare: (title: string, text: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, member, events, onShare }) => {
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  const lastMonthStr = lastMonth.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(lastMonthStr);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setReport('');
      setError('');
      setIsGenerating(false);
      setStartDate(lastMonthStr);
      setEndDate(today);
    }
  }, [isOpen, lastMonthStr, today]);

  const handleGenerateReport = async () => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        setError("A chave da API do Gemini não está configurada. Não é possível gerar relatórios.");
        return;
    }

    setIsGenerating(true);
    setReport('');
    setError('');

    try {
      const filteredEvents = events.filter(event => {
        const eventDate = event.date;
        return eventDate >= startDate && eventDate <= endDate;
      }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

      if (filteredEvents.length === 0) {
        setError("Nenhum evento encontrado no período selecionado.");
        setIsGenerating(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const prompt = `
        Você é um assistente de geração de relatórios para o Tribunal de Contas do Estado do Piauí (TCE-PI).
        Sua tarefa é criar um relatório de atividades conciso e profissional para ${member.name} com base nos eventos fornecidos.
        
        Período do Relatório: ${new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}.

        Instruções:
        1. Organize os eventos cronologicamente.
        2. Para cada evento, mencione a data, o título, o horário (se aplicável), e um resumo da descrição.
        3. Mantenha um tom formal e objetivo.
        4. No final, escreva um parágrafo de resumo geral das atividades no período.
        
        Dados dos eventos (JSON):
        ${JSON.stringify(filteredEvents, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setReport(response.text);

    } catch (err) {
      console.error("Erro ao gerar relatório com a API Gemini:", err);
      setError("Ocorreu um erro ao gerar o relatório. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleShare = () => {
      const reportTitle = `Relatório de Atividades de ${member.name} - ${new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR')} a ${new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}`;
      onShare(reportTitle, report);
  }

  if (!isOpen) return null;

  const inputStyle = "shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-tce-pi-blue";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-tce-pi-green">Gerar Relatório de Atividades</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
            <p className="text-sm text-gray-600">Selecione o período para gerar o relatório de atividades de <strong>{member.name}</strong>.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="startDate">Data de Início</label>
                    <input type="date" name="startDate" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputStyle} />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="endDate">Data de Fim</label>
                    <input type="date" name="endDate" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className={inputStyle} />
                </div>
            </div>
            <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-tce-pi-blue text-white rounded-md hover:bg-opacity-90 flex items-center justify-center disabled:bg-gray-400"
            >
                {isGenerating ? 'Gerando Relatório...' : 'Gerar com IA'}
            </button>
            
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}

            {report && (
                <div className="mt-4 pt-4 border-t">
                     <h3 className="text-lg font-bold text-gray-800 mb-2">Relatório Gerado</h3>
                     <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-[40vh] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-800 text-sm font-sans">{report}</pre>
                     </div>
                </div>
            )}
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Fechar
            </button>
            <button 
                type="button" 
                onClick={handleShare}
                disabled={!report || isGenerating}
                className="px-4 py-2 bg-tce-pi-green text-white rounded-md hover:bg-tce-pi-green-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Compartilhar Relatório
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;