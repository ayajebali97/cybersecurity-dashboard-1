import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { Clock, AlertTriangle, Shield, Server, Eye, Filter, Calendar, Search } from 'lucide-react';

interface ScanResult {
  target: string;
  openPorts: number[];
  issues: string[];
  risk: string;
  recommendations: string[];
  riskScore: number;
}

interface ScanHistory {
  id: number;
  target: string;
  result: ScanResult;
  created_at: string;
}

export default function History() {
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanHistory | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchHistory();
  }, [router]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setScans(data);
      } else {
        setError(data.error || 'Failed to fetch history');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskClass = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'risk-low';
      case 'MEDIUM':
        return 'risk-medium';
      case 'HIGH':
        return 'risk-high';
      default:
        return '';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredScans = scans.filter(scan => {
    const matchesFilter = filter === 'all' || scan.result.risk === filter;
    const matchesSearch = scan.target.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: scans.length,
    high: scans.filter(s => s.result.risk === 'HIGH').length,
    medium: scans.filter(s => s.result.risk === 'MEDIUM').length,
    low: scans.filter(s => s.result.risk === 'LOW').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
          <p className="mt-2 text-gray-600">Review and analyze your past security scans</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.high}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-xl">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                <Server className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{stats.low}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by target..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('HIGH')}
                className={`btn ${filter === 'HIGH' ? 'btn-danger' : 'btn-secondary'}`}
              >
                High ({stats.high})
              </button>
              <button
                onClick={() => setFilter('MEDIUM')}
                className={`btn ${filter === 'MEDIUM' ? 'btn-secondary' : 'btn-secondary'}`}
              >
                Medium ({stats.medium})
              </button>
              <button
                onClick={() => setFilter('LOW')}
                className={`btn ${filter === 'LOW' ? 'btn-success' : 'btn-secondary'}`}
              >
                Low ({stats.low})
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card mb-6">
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Scans Table */}
        {filteredScans.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scans found</h3>
              <p className="text-gray-600 mb-6">
                {scans.length === 0 ? 'Start your first security scan to see results here.' : 'Try adjusting your filters or search terms.'}
              </p>
              {scans.length === 0 && (
                <button
                  onClick={() => router.push('/scan')}
                  className="btn btn-primary"
                >
                  Start Your First Scan
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Target</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Risk Level</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Score</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Issues</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Open Ports</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map((scan) => (
                    <tr key={scan.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{scan.target}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`risk-badge ${getRiskClass(scan.result.risk)}`}>
                          {scan.result.risk}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900 font-medium">{scan.result.riskScore}/7</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-gray-900">{scan.result.issues.length}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <Server className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-gray-900">{scan.result.openPorts.length}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-600 text-sm">{formatDate(scan.created_at)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedScan(scan)}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Scan Details Modal */}
        {selectedScan && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Scan Details</h3>
                <button
                  onClick={() => setSelectedScan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Target and Risk */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedScan.target}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <span className={`risk-badge ${getRiskClass(selectedScan.result.risk)}`}>
                      {selectedScan.result.risk}
                    </span>
                  </div>
                </div>

                {/* Issues */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h4 className="font-semibold text-red-800 mb-3">Security Issues ({selectedScan.result.issues.length})</h4>
                  {selectedScan.result.issues.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedScan.result.issues.map((issue, index) => (
                        <li key={index} className="flex items-center text-red-700">
                          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-600">No security issues detected</p>
                  )}
                </div>

                {/* Open Ports */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-3">Open Ports ({selectedScan.result.openPorts.length})</h4>
                  {selectedScan.result.openPorts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedScan.result.openPorts.map((port) => (
                        <span key={port} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {port}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-blue-600">No open ports detected</p>
                  )}
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-3">Recommendations ({selectedScan.result.recommendations.length})</h4>
                  {selectedScan.result.recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedScan.result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-green-700">
                          <Shield className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-600">No recommendations at this time</p>
                  )}
                </div>

                {/* Scan Info */}
                <div className="text-sm text-gray-500 text-center">
                  Scanned on {formatDate(selectedScan.created_at)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
