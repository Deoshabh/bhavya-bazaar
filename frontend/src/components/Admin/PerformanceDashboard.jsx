import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon, 
  EyeIcon,
  DocumentTextIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { PerformanceMonitor } from '../../utils/performanceOptimizer';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [webVitals, setWebVitals] = useState({});

  useEffect(() => {
    // Load Web Vitals dynamically
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => setWebVitals(prev => ({ ...prev, CLS: metric })));
      getFID((metric) => setWebVitals(prev => ({ ...prev, FID: metric })));
      getFCP((metric) => setWebVitals(prev => ({ ...prev, FCP: metric })));
      getLCP((metric) => setWebVitals(prev => ({ ...prev, LCP: metric })));
      getTTFB((metric) => setWebVitals(prev => ({ ...prev, TTFB: metric })));
    });

    // Get performance metrics periodically
    const updateMetrics = () => {
      const performanceData = PerformanceMonitor.getPerformanceReport();
      setMetrics(performanceData);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatMetricValue = (value, unit = 'ms') => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)}${unit}`;
    }
    return value || 'N/A';
  };

  const getMetricColor = (metric, value) => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    if (!thresholds[metric] || typeof value !== 'number') return 'text-gray-600';
    
    if (value <= thresholds[metric].good) return 'text-green-600';
    if (value <= thresholds[metric].poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const MetricCard = ({ title, value, unit, icon: Icon, description, color = 'text-gray-600' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className={`text-2xl font-bold ${color}`}>
          {formatMetricValue(value, unit)}
        </div>
      </div>
    </motion.div>
  );

  const WebVitalsCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ChartBarIcon className="w-6 h-6 text-blue-600 mr-2" />
        Core Web Vitals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(webVitals).map(([metric, data]) => (
          <div key={metric} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600 mb-1">{metric}</div>
            <div className={`text-xl font-bold ${getMetricColor(metric, data?.value)}`}>
              {formatMetricValue(data?.value, metric === 'CLS' ? '' : 'ms')}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data?.rating || 'Measuring...'}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const SlowQueriesCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ClockIcon className="w-6 h-6 text-red-600 mr-2" />
        Performance Issues
      </h3>
      
      {metrics?.summary?.slowPages?.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Slow Page Loads</h4>
          {metrics.summary.slowPages.map((page, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{page.page}</span>
              <span className="text-sm font-medium text-red-600">
                {formatMetricValue(page.loadTime)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {metrics?.summary?.slowComponents?.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Slow Components</h4>
          {metrics.summary.slowComponents.slice(0, 5).map((component, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">{component.component}</span>
              <span className="text-sm font-medium text-yellow-600">
                {formatMetricValue(component.avgRenderTime)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {(!metrics?.summary?.slowPages?.length && !metrics?.summary?.slowComponents?.length) && (
        <div className="text-center py-4 text-gray-500">
          <CheckIcon className="w-12 h-12 mx-auto text-green-500 mb-2" />
          No performance issues detected
        </div>
      )}
    </motion.div>
  );

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Show Performance Dashboard"
      >
        <CpuChipIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-96 h-full bg-gray-50 shadow-xl z-50 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Performance Monitor</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Web Vitals */}
          <WebVitalsCard />

          {/* Performance Metrics */}
          {metrics && (
            <>
              <MetricCard
                title="Total Queries"
                value={metrics.totalQueries}
                unit=""
                icon={DocumentTextIcon}
                description="Database queries executed"
              />

              <MetricCard
                title="Cache Hit Rate"
                value={metrics.cacheHitRate}
                unit=""
                icon={CpuChipIcon}
                description="Percentage of cached responses"
                color={parseFloat(metrics.cacheHitRate) > 70 ? 'text-green-600' : 'text-yellow-600'}
              />

              <MetricCard
                title="Slow Queries"
                value={metrics.slowQueries?.length || 0}
                unit=""
                icon={ClockIcon}
                description="Queries taking >1s"
                color={metrics.slowQueries?.length > 0 ? 'text-red-600' : 'text-green-600'}
              />
            </>
          )}

          {/* Slow Queries and Components */}
          {metrics && <SlowQueriesCard />}

          {/* Browser Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <EyeIcon className="w-6 h-6 text-blue-600 mr-2" />
              Browser Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">User Agent:</span>
                <span className="text-right text-gray-900 max-w-48 truncate">
                  {navigator.userAgent.split(' ')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory:</span>
                <span className="text-gray-900">
                  {navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connection:</span>
                <span className="text-gray-900">
                  {navigator.connection?.effectiveType || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Screen:</span>
                <span className="text-gray-900">
                  {window.screen.width}×{window.screen.height}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceDashboard;
