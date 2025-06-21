'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Definizione dei tipi
interface Deposit {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  paymentMethod: 'credit_card' | 'crypto' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

interface UserDeposit {
  userId: string;
  userName: string;
  totalDeposit: number;
  creditCardDeposit: number;
  cryptoDeposit: number;
  bankTransferDeposit: number;
}

const AdminDeposits: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [userDeposits, setUserDeposits] = useState<UserDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'day'>('all');

  // Colori per i grafici
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    // Rimosso il controllo di autenticazione, la pagina è sempre visibile
    fetchDeposits();
  }, [timeRange]);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      // In un'implementazione reale, questa sarebbe una chiamata API
      // Per ora, utilizziamo dati di esempio
      const mockDeposits: Deposit[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          amount: 1000,
          paymentMethod: 'credit_card',
          status: 'completed',
          createdAt: '2023-05-15T10:30:00Z'
        },
        {
          id: '2',
          userId: 'user1',
          userName: 'John Doe',
          amount: 500,
          paymentMethod: 'crypto',
          status: 'completed',
          createdAt: '2023-06-20T14:45:00Z'
        },
        {
          id: '3',
          userId: 'user2',
          userName: 'Jane Smith',
          amount: 2000,
          paymentMethod: 'bank_transfer',
          status: 'completed',
          createdAt: '2023-07-05T09:15:00Z'
        },
        {
          id: '4',
          userId: 'user2',
          userName: 'Jane Smith',
          amount: 1500,
          paymentMethod: 'credit_card',
          status: 'completed',
          createdAt: '2023-08-10T16:20:00Z'
        },
        {
          id: '5',
          userId: 'user3',
          userName: 'Bob Johnson',
          amount: 3000,
          paymentMethod: 'crypto',
          status: 'completed',
          createdAt: '2023-09-25T11:10:00Z'
        },
        {
          id: '6',
          userId: 'user3',
          userName: 'Bob Johnson',
          amount: 2500,
          paymentMethod: 'bank_transfer',
          status: 'pending',
          createdAt: '2023-10-30T13:40:00Z'
        }
      ];

      // Filtra i depositi in base al periodo selezionato
      const filteredDeposits = filterDepositsByTimeRange(mockDeposits, timeRange);
      setDeposits(filteredDeposits);

      // Calcola i depositi per utente
      const userDepositsMap = new Map<string, UserDeposit>();
      
      filteredDeposits.forEach(deposit => {
        if (deposit.status === 'completed') {
          if (!userDepositsMap.has(deposit.userId)) {
            userDepositsMap.set(deposit.userId, {
              userId: deposit.userId,
              userName: deposit.userName,
              totalDeposit: 0,
              creditCardDeposit: 0,
              cryptoDeposit: 0,
              bankTransferDeposit: 0
            });
          }
          
          const userDeposit = userDepositsMap.get(deposit.userId)!;
          userDeposit.totalDeposit += deposit.amount;
          
          switch (deposit.paymentMethod) {
            case 'credit_card':
              userDeposit.creditCardDeposit += deposit.amount;
              break;
            case 'crypto':
              userDeposit.cryptoDeposit += deposit.amount;
              break;
            case 'bank_transfer':
              userDeposit.bankTransferDeposit += deposit.amount;
              break;
          }
        }
      });
      
      setUserDeposits(Array.from(userDepositsMap.values()));
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching deposits:', err);
      setError('Failed to fetch deposits data');
      setIsLoading(false);
    }
  };

  const filterDepositsByTimeRange = (deposits: Deposit[], range: string): Deposit[] => {
    if (range === 'all') return deposits;
    
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return deposits;
    }
    
    return deposits.filter(deposit => new Date(deposit.createdAt) >= startDate);
  };

  const getTotalByPaymentMethod = () => {
    const totals = {
      creditCard: 0,
      crypto: 0,
      bankTransfer: 0
    };
    
    userDeposits.forEach(user => {
      totals.creditCard += user.creditCardDeposit;
      totals.crypto += user.cryptoDeposit;
      totals.bankTransfer += user.bankTransferDeposit;
    });
    
    return [
      { name: 'Credit Card', value: totals.creditCard },
      { name: 'Crypto', value: totals.crypto },
      { name: 'Bank Transfer', value: totals.bankTransfer }
    ];
  };

  const getUserDepositData = (userId: string) => {
    const user = userDeposits.find(u => u.userId === userId);
    if (!user) return [];
    
    return [
      { name: 'Credit Card', value: user.creditCardDeposit },
      { name: 'Crypto', value: user.cryptoDeposit },
      { name: 'Bank Transfer', value: user.bankTransferDeposit }
    ];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#695936]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-[#695936] mb-6">User Deposits Dashboard</h2>
      
      {/* Filtri per periodo */}
      <div className="mb-6 flex items-center">
        <span className="mr-3 text-gray-700">Time Range:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-md ${timeRange === 'all' ? 'bg-[#695936] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-md ${timeRange === 'month' ? 'bg-[#695936] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-md ${timeRange === 'week' ? 'bg-[#695936] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3 py-1 rounded-md ${timeRange === 'day' ? 'bg-[#695936] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Last 24h
          </button>
        </div>
      </div>
      
      {/* Riepilogo totale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total Deposits</h3>
          <p className="text-2xl font-bold text-[#695936]">
            {formatCurrency(userDeposits.reduce((sum, user) => sum + user.totalDeposit, 0))}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-[#695936]">{userDeposits.length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Avg. Deposit per User</h3>
          <p className="text-2xl font-bold text-[#695936]">
            {formatCurrency(userDeposits.length > 0 
              ? userDeposits.reduce((sum, user) => sum + user.totalDeposit, 0) / userDeposits.length 
              : 0
            )}
          </p>
        </div>
      </div>
      
      {/* Grafico a torta per la distribuzione dei metodi di pagamento */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Deposits by Payment Method</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getTotalByPaymentMethod()}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getTotalByPaymentMethod().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Grafico a barre per i depositi per utente */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Deposits by User</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={userDeposits}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="userName" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="creditCardDeposit" name="Credit Card" stackId="a" fill="#0088FE" />
              <Bar dataKey="cryptoDeposit" name="Crypto" stackId="a" fill="#00C49F" />
              <Bar dataKey="bankTransferDeposit" name="Bank Transfer" stackId="a" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Tabella dettagliata degli utenti */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">User Deposits Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">User</th>
                <th className="py-2 px-4 border-b text-right">Credit Card</th>
                <th className="py-2 px-4 border-b text-right">Crypto</th>
                <th className="py-2 px-4 border-b text-right">Bank Transfer</th>
                <th className="py-2 px-4 border-b text-right">Total</th>
                <th className="py-2 px-4 border-b text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {userDeposits.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.userName}</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(user.creditCardDeposit)}</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(user.cryptoDeposit)}</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(user.bankTransferDeposit)}</td>
                  <td className="py-2 px-4 border-b text-right font-medium">{formatCurrency(user.totalDeposit)}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => setSelectedUser(selectedUser === user.userId ? null : user.userId)}
                      className="text-[#695936] hover:underline"
                    >
                      {selectedUser === user.userId ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Dettaglio utente selezionato */}
      {selectedUser && (
        <div className="mt-8 p-4 border rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {userDeposits.find(u => u.userId === selectedUser)?.userName} - Deposit Details
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getUserDepositData(selectedUser)}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getUserDepositData(selectedUser).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeposits;