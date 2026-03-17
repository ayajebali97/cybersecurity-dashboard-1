import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { Shield, AlertTriangle, CheckCircle, Clock, Server, Globe, Lock, X, Loader2 } from 'lucide-react';

interface ScanResult {
  target: string;
  openPorts: number[];
  issues: string[];
  risk: string;
  recommendations: string[];
  riskScore: number;
  scanTime?: string;
}

export default function Scan() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setShowDetails(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ target }),
      });

      const data = await response.json();

      if (response.ok) {
        const scanResult: ScanResult = {
          target: data.target,
          openPorts: data.openPorts,
          issues: data.issues,
          risk: data.risk,
          recommendations: data.recommendations,
          riskScore: data.riskScore,
          scanTime: new Date().toLocaleString(),
        };
        setResult(scanResult);
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPortService = (port: number) => {
    const services: { [key: number]: string } = {
      21: 'FTP',
      22: 'SSH',
      80: 'HTTP',
      443: 'HTTPS',
    };
    return services[port] || 'Unknown';
  };

  const getIssueIcon = (issue: string) => {
    if (issue.includes('SSH')) return <Lock className="h-4 w-4" />;
    if (issue.includes('FTP')) return <Server className="h-4 w-4" />;
    if (issue.includes('HTTPS')) return <Globe className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Scanner</h1>
          <p className="mt-2 text-gray-600">Perform comprehensive security scans on IP addresses and domains</p>
        </div>

        {/* Scan Input */}
        <div className="card mb-8">
          <form onSubmit={handleScan} className="space-y-6">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-2">
                Target (IP Address or Domain)
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 192.168.1.1 or example.com"
                  className="input-field flex-1"
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Start Scan
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                <X className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-red-800">{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Scan Results */}
        {result && (
          <div className="space-y-6">
            {/* Main Result Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Scan Results</h2>
                  <p className="text-gray-600 mt-1">Target: {result.target}</p>
                  {result.scanTime && (
                    <p className="text-sm text-gray-500 mt-1">Scanned: {result.scanTime}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl border-2 font-bold text-lg ${getRiskColor(result.risk)}`}>
                    {result.risk} RISK
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Score: {result.riskScore}/7</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                    <Server className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{result.openPorts.length}</p>
                  <p className="text-sm text-gray-600">Open Ports</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{result.issues.length}</p>
                  <p className="text-sm text-gray-600">Security Issues</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{result.recommendations.length}</p>
                  <p className="text-sm text-gray-600">Recommendations</p>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="btn btn-secondary w-full"
              >
                {showDetails ? 'Hide' : 'Show'} Detailed Results
              </button>
            </div>

            {/* Detailed Results */}
            {showDetails && (
              <>
                {/* Open Ports */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Server className="h-5 w-5 mr-2 text-blue-600" />
                    Open Ports
                  </h3>
                  {result.openPorts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Port</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.openPorts.map((port) => (
                            <tr key={port} className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                <span className="font-mono text-gray-900">{port}</span>
                              </td>
                              <td className="py-3 px-4 text-gray-700">{getPortService(port)}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Open
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-gray-600">No open ports detected</p>
                    </div>
                  )}
                </div>

                {/* Security Issues */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Security Issues
                  </h3>
                  {result.issues.length > 0 ? (
                    <div className="space-y-3">
                      {result.issues.map((issue, index) => (
                        <div key={index} className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex-shrink-0 text-red-600 mr-3">
                            {getIssueIcon(issue)}
                          </div>
                          <span className="text-red-800 font-medium">{issue}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-gray-600">No security issues detected</p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Security Recommendations
                  </h3>
                  {result.recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start p-4 bg-green-50 border border-green-200 rounded-xl">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-green-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-gray-600">No recommendations at this time</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
