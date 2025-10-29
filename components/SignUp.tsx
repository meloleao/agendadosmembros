import React, { useState } from 'react';
import { Member } from '../types';

interface SignUpProps {
  onSignUp: (username, password, memberId) => boolean;
  onNavigateToLogin: () => void;
  members: Member[];
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onNavigateToLogin, members }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!memberId) {
        setError('Por favor, selecione um membro.');
        return;
    }
    const success = onSignUp(username, password, memberId);
    if (!success) {
      setError('Este nome de usuário já está em uso.');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <svg className="mx-auto h-12 w-auto text-tce-pi-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h1 className="mt-4 text-3xl font-bold text-tce-pi-green">Criar Nova Conta</h1>
          <p className="text-gray-600 mt-1">Associe sua conta a um membro</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Nome de Usuário
            </label>
            <input
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-tce-pi-blue"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-tce-pi-blue"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
           <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="member">
              Associar ao Membro
            </label>
            <select
              id="member"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-tce-pi-blue"
              required
            >
                <option value="" disabled>Selecione um membro</option>
                {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-tce-pi-green hover:bg-tce-pi-green-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Criar Conta
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem uma conta?{' '}
          <button onClick={onNavigateToLogin} className="font-bold text-tce-pi-blue hover:text-tce-pi-blue-dark">
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;