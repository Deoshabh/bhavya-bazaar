/**
 * Error Monitoring Dashboard Component
 * Provides real-time error tracking and system health monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ErrorLogger, ERROR_TYPES, ERROR_SEVERITY } from '../../utils/errorHandler';
import { checkApiHealth } from '../../utils/enhancedAxios';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

const ErrorMonitoringDashboard = () => {
  const [errors, setErrors] = useState([]);
  const [apiHealth, setApiHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    loadErrorHistory();
    checkHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadErrorHistory();
      checkHealth();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadErrorHistory = () => {
    const errorHistory = ErrorLogger.getErrorHistory();
    setErrors(errorHistory);
  };

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const health = await checkApiHealth();
      setApiHealth(health);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setHealthLoading(false);
    }
  };

  const clearErrorHistory = () => {
    ErrorLogger.clearErrorHistory();
    setErrors([]);
  };

  const getErrorTypeColor = (type) => {
    const colors = {
      [ERROR_TYPES.NETWORK]: 'bg-blue-100 text-blue-800',
      [ERROR_TYPES.AUTHENTICATION]: 'bg-red-100 text-red-800',
      [ERROR_TYPES.VALIDATION]: 'bg-yellow-100 text-yellow-800',
      [ERROR_TYPES.BUSINESS_LOGIC]: 'bg-purple-100 text-purple-800',
      [ERROR_TYPES.SYSTEM]: 'bg-red-100 text-red-800',
      [ERROR_TYPES.TIMEOUT]: 'bg-orange-100 text-orange-800',
      [ERROR_TYPES.CORS]: 'bg-indigo-100 text-indigo-800',
      [ERROR_TYPES.UNKNOWN]: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors[ERROR_TYPES.UNKNOWN];
  };

  const getSeverityColor = (severity) => {
    const colors = {
      [ERROR_SEVERITY.LOW]: 'bg-green-100 text-green-800',
      [ERROR_SEVERITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [ERROR_SEVERITY.HIGH]: 'bg-orange-100 text-orange-800',
      [ERROR_SEVERITY.CRITICAL]: 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors[ERROR_SEVERITY.LOW];
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getErrorStats = () => {
    const stats = {
      total: errors.length,
      byType: {},
      bySeverity: {},
      recent: errors.filter(e => 
        new Date(e.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
      ).length
    };

    errors.forEach(error => {
      stats.byType[error.errorType] = (stats.byType[error.errorType] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  };

  const stats = getErrorStats();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Error Monitoring Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={checkHealth} 
            disabled={healthLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={clearErrorHistory}
            variant="destructive"
            disabled={errors.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getHealthIcon(apiHealth?.status)}
            API Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiHealth ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={`${
                  apiHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  apiHealth.status === 'unhealthy' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {apiHealth.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="font-semibold">{apiHealth.responseTime}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Checked</p>
                <p className="font-semibold">{formatTimestamp(new Date())}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Checking API health...</p>
          )}
        </CardContent>
      </Card>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Recent (1h)</p>
                <p className="text-2xl font-bold">{stats.recent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">By Type</p>
              <div className="space-y-1">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span>{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">By Severity</p>
              <div className="space-y-1">
                {Object.entries(stats.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between text-sm">
                    <span>{severity}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No errors recorded</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {errors.slice(0, 20).map((error, index) => (
                <div 
                  key={error.correlationId || index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedError(error)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge className={getErrorTypeColor(error.errorType)}>
                        {error.errorType}
                      </Badge>
                      <Badge className={getSeverityColor(error.severity)}>
                        {error.severity}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(error.timestamp)}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{error.message}</p>
                  <p className="text-sm text-gray-600">{error.url}</p>
                  {error.correlationId && (
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {error.correlationId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Error Details</h2>
                <Button 
                  onClick={() => setSelectedError(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Correlation ID</p>
                    <p className="font-mono text-sm">{selectedError.correlationId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Timestamp</p>
                    <p>{formatTimestamp(selectedError.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <Badge className={getErrorTypeColor(selectedError.errorType)}>
                      {selectedError.errorType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Severity</p>
                    <Badge className={getSeverityColor(selectedError.severity)}>
                      {selectedError.severity}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Message</p>
                  <p className="bg-gray-100 p-3 rounded">{selectedError.message}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">URL</p>
                  <p className="bg-gray-100 p-3 rounded font-mono text-sm">{selectedError.url}</p>
                </div>
                
                {selectedError.context && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Context</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedError.context, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedError.stack && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Stack Trace</p>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorMonitoringDashboard;
