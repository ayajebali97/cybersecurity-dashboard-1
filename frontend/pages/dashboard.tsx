import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { Shield, Activity, AlertTriangle, TrendingUp, Clock, Target } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    highRiskScans: 0,
    mediumRiskScans: 0,
    lowRiskScans: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
      fetchRecentScans();
    }
  }, [router]);

  const fetchRecentScans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentScans(data.slice(0, 5)); // Get last 5 scans
        
        // Calculate stats
        const stats = data.reduce((acc: any, scan: any) => {
          acc.totalScans++;
          if (scan.result.risk === 'HIGH') acc.highRiskScans++;
          else if (scan.result.risk === 'MEDIUM') acc.mediumRiskScans++;
          else if (scan.result.risk === 'LOW') acc.lowRiskScans++;
          return acc;
        }, { totalScans: 0, highRiskScans: 0, mediumRiskScans: 0, lowRiskScans: 0 });
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch recent scans:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage your cybersecurity scans</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskScans}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.mediumRiskScans}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{stats.lowRiskScans}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link href="/scan">
                <button className="w-full btn btn-primary text-left flex items-center justify-between group">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 mr-3" />
                    <span>Start New Scan</span>
                  </div>
                  <span className="text-primary-200 group-hover:text-primary-300">→</span>
                </button>
              </Link>
              <Link href="/history">
                <button className="w-full btn btn-secondary text-left flex items-center justify-between group">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>View Scan History</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-500">→</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Tips</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="ml-3 text-sm text-gray-600">Regularly scan your systems for vulnerabilities</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="ml-3 text-sm text-gray-600">Keep your software and systems updated</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="ml-3 text-sm text-gray-600">Use strong, unique passwords for all accounts</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="ml-3 text-sm text-gray-600">Enable HTTPS on all web services</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Scans</h2>
              <Link href="/history">
                <button className="btn btn-secondary">View All</button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{scan.target}</span>
                      <span className={`risk-badge ml-3 risk-${scan.result.risk.toLowerCase()}`}>
                        {scan.result.risk}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(scan.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Issues</p>
                      <p className="font-semibold text-gray-900">{scan.result.issues.length}</p>
                    </div>
                    <Link href={`/scan?details=${scan.id}`}>
                      <button className="btn btn-secondary">View Details</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
