import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, DollarSign, BookOpen, ArrowUpRight, ArrowDownRight, RefreshCw, LayoutDashboard, Printer, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrintDesigner } from '../components/PrintDesigner';

const gateToGlyphName: Record<string, string> = {
  N: 'Syla',
  NE: 'Zayn',
  E: 'Lomi',
  SE: 'Vorak',
  S: 'Khem',
  SW: 'Bara',
  W: 'Tara',
  NW: 'Oron'
};

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-[#111] border border-gray-800 p-6 rounded-lg shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-[#00d0ff]/10 rounded-lg">
        <Icon className="w-6 h-6 text-[#00d0ff]" />
      </div>
      {change && (
        <div className={`flex items-center text-xs ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {change}
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-200 tracking-tight">{value}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'analytics' | 'print'>('analytics');
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = stats?.gateDistribution?.map((item: any) => ({
    name: gateToGlyphName[item.name] || item.name,
    value: item.value
  })) || [];

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-widest text-gray-200 mb-2 uppercase">System Control</h1>
            <p className="text-gray-500 font-serif italic">Administrative interface for The Book of Solobility</p>
          </div>

          <div className="flex items-center bg-[#111] border border-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-all ${activeView === 'analytics' ? 'bg-[#00d0ff] text-black font-bold' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Analytics
            </button>
            <button
              onClick={() => setActiveView('print')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-all ${activeView === 'print' ? 'bg-[#00d0ff] text-black font-bold' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Printer className="w-4 h-4" /> Print Designer
            </button>
            <button
              onClick={() => navigate('/designer')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest rounded transition-all text-gray-500 hover:text-[#00d0ff]`}
            >
              <Layout className="w-4 h-4" /> Book Designer
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchStats}
              className="p-2 bg-[#111] border border-gray-800 rounded text-gray-400 hover:text-[#00d0ff] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-2 bg-[#111] border border-gray-800 rounded text-xs text-gray-400 uppercase tracking-widest">
              Live Feed: Active
            </div>
          </div>
        </header>

        {activeView === 'analytics' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard title="Total Conversions" value={stats?.totalConversions || 0} icon={Users} trend="up" />
              <StatCard title="Gross Revenue" value={`$${stats?.totalRevenue?.toLocaleString() || 0}`} icon={DollarSign} trend="up" />
              <StatCard title="Books Forged" value={stats?.totalConversions || 0} icon={BookOpen} trend="up" />
              <StatCard title="Active Gates" value={stats?.gateDistribution?.length || 0} icon={TrendingUp} trend="up" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Popular Gates */}
              <div className="bg-[#111] border border-gray-800 p-8 rounded-lg shadow-xl">
                <h3 className="text-gray-200 text-sm uppercase tracking-widest mb-8">Popular Gates Distribution</h3>
                <div className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#555"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#555"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff' }}
                          itemStyle={{ color: '#00d0ff' }}
                        />
                        <Bar dataKey="value" fill="#00d0ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-600 italic">No data yet</div>
                  )}
                </div>
              </div>

              {/* Revenue Growth Placeholder */}
              <div className="bg-[#111] border border-gray-800 p-8 rounded-lg shadow-xl">
                <h3 className="text-gray-200 text-sm uppercase tracking-widest mb-8">System Health</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs uppercase tracking-widest">Database Status</span>
                    <span className="text-emerald-500 text-xs uppercase tracking-widest">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs uppercase tracking-widest">Stripe Integration</span>
                    <span className="text-amber-500 text-xs uppercase tracking-widest">Simulated</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs uppercase tracking-widest">API Latency</span>
                    <span className="text-gray-300 text-xs uppercase tracking-widest">12ms</span>
                  </div>
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-gray-600 text-[10px] leading-relaxed italic">
                      All systems are currently operating within normal parameters. The gate network is stable.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-[#111] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="p-6 border-bottom border-gray-800">
                <h3 className="text-gray-200 text-sm uppercase tracking-widest">Recent Forgings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/50 border-y border-gray-800">
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">User</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">Gate</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">Tier</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">Status</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {stats?.recentPurchases?.length > 0 ? (
                      stats.recentPurchases.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300">{row.user_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-400 font-serif italic">{gateToGlyphName[row.gate] || row.gate}</td>
                          <td className="px-6 py-4 text-sm text-gray-400 capitalize">{row.tier}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded ${row.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-200 font-mono text-right">${(row.amount / 100).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-600 italic">No forgings recorded yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PrintDesigner purchases={stats?.recentPurchases || []} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
