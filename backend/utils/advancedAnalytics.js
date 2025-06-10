/**
 * Advanced Analytics & Business Intelligence System
 * Comprehensive analytics for Bhavya Bazaar platform
 */

const redis = require('../config/redis');
const ErrorHandler = require('./ErrorHandler');

class AdvancedAnalytics {
  
  /**
   * User Behavior Analytics
   */
  static async trackUserBehavior(userId, action, metadata = {}) {
    try {
      const event = {
        userId,
        action,
        metadata,
        timestamp: new Date().toISOString(),
        sessionId: metadata.sessionId || null,
        ip: metadata.ip || null,
        userAgent: metadata.userAgent || null
      };

      // Store in Redis streams for real-time processing
      await redis.xadd('analytics:user_behavior', '*', 
        'userId', userId,
        'action', action,
        'data', JSON.stringify(event)
      );

      // Update user activity counters
      const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      await redis.hincrby(`analytics:daily:${dateKey}`, `action:${action}`, 1);
      await redis.hincrby(`analytics:user:${userId}`, action, 1);

      console.log(`📊 User behavior tracked: ${userId} -> ${action}`);
      return true;
    } catch (error) {
      console.error('❌ User behavior tracking failed:', error);
      return false;
    }
  }

  /**
   * E-commerce Analytics
   */
  static async trackEcommerceEvent(eventType, data) {
    try {
      const event = {
        eventType,
        data,
        timestamp: new Date().toISOString(),
        value: data.value || 0,
        currency: data.currency || 'INR'
      };

      await redis.xadd('analytics:ecommerce', '*',
        'eventType', eventType,
        'data', JSON.stringify(event)
      );

      // Update specific counters based on event type
      const today = new Date().toISOString().split('T')[0];
      
      switch (eventType) {
        case 'purchase':
          await redis.hincrby(`analytics:daily:${today}`, 'purchases', 1);
          await redis.hincrbyfloat(`analytics:daily:${today}`, 'revenue', data.value || 0);
          break;
        
        case 'add_to_cart':
          await redis.hincrby(`analytics:daily:${today}`, 'cart_additions', 1);
          break;
        
        case 'product_view':
          await redis.hincrby(`analytics:daily:${today}`, 'product_views', 1);
          await redis.zincrby('analytics:popular_products', 1, data.productId);
          break;
        
        case 'search':
          await redis.zincrby('analytics:search_terms', 1, data.query);
          break;
      }

      return true;
    } catch (error) {
      console.error('❌ E-commerce analytics tracking failed:', error);
      return false;
    }
  }

  /**
   * Real-time Dashboard Data
   */
  static async getRealTimeDashboard() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
      
      // Get today's metrics
      const dailyMetrics = await redis.hgetall(`analytics:daily:${today}`);
      
      // Get this hour's active users (using Redis HyperLogLog)
      const activeUsers = await redis.pfcount(`analytics:active_users:${thisHour}`);
      
      // Get top products
      const topProducts = await redis.zrevrange('analytics:popular_products', 0, 9, 'WITHSCORES');
      
      // Get recent search terms
      const topSearches = await redis.zrevrange('analytics:search_terms', 0, 9, 'WITHSCORES');
      
      // Format response
      const dashboard = {
        timestamp: new Date().toISOString(),
        today: {
          revenue: parseFloat(dailyMetrics.revenue || 0),
          orders: parseInt(dailyMetrics.purchases || 0),
          product_views: parseInt(dailyMetrics.product_views || 0),
          cart_additions: parseInt(dailyMetrics.cart_additions || 0)
        },
        real_time: {
          active_users: activeUsers,
          current_hour: thisHour
        },
        top_products: this.formatZRangeResults(topProducts),
        top_searches: this.formatZRangeResults(topSearches)
      };

      return dashboard;
    } catch (error) {
      console.error('❌ Real-time dashboard data retrieval failed:', error);
      return null;
    }
  }

  /**
   * Sales Analytics
   */
  static async getSalesAnalytics(dateRange = 30) {
    try {
      const analytics = {
        period: `${dateRange} days`,
        sales: [],
        revenue: [],
        top_selling_products: [],
        customer_segments: {},
        growth_metrics: {}
      };

      // Generate date range
      const dates = [];
      for (let i = dateRange - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Collect daily sales data
      for (const date of dates) {
        const dailyData = await redis.hgetall(`analytics:daily:${date}`);
        analytics.sales.push({
          date,
          orders: parseInt(dailyData.purchases || 0),
          revenue: parseFloat(dailyData.revenue || 0)
        });
      }

      // Calculate growth metrics
      const totalRevenue = analytics.sales.reduce((sum, day) => sum + day.revenue, 0);
      const totalOrders = analytics.sales.reduce((sum, day) => sum + day.orders, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      analytics.growth_metrics = {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        average_order_value: avgOrderValue,
        revenue_growth: this.calculateGrowthRate(analytics.sales, 'revenue'),
        order_growth: this.calculateGrowthRate(analytics.sales, 'orders')
      };

      return analytics;
    } catch (error) {
      console.error('❌ Sales analytics retrieval failed:', error);
      return null;
    }
  }

  /**
   * Customer Analytics
   */
  static async getCustomerAnalytics() {
    try {
      const analytics = {
        total_customers: 0,
        new_customers_today: 0,
        customer_lifetime_value: 0,
        retention_rate: 0,
        top_customers: [],
        geographic_distribution: {},
        behavior_patterns: {}
      };

      // This would typically query the user database
      // For now, we'll use Redis analytics data
      
      const today = new Date().toISOString().split('T')[0];
      const todayMetrics = await redis.hgetall(`analytics:daily:${today}`);
      
      analytics.new_customers_today = parseInt(todayMetrics.new_signups || 0);

      // Get customer behavior patterns from analytics
      const behaviorStream = await redis.xrevrange('analytics:user_behavior', '+', '-', 'COUNT', 100);
      
      const actionCounts = {};
      behaviorStream.forEach(([id, fields]) => {
        const action = fields[fields.indexOf('action') + 1];
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      });

      analytics.behavior_patterns = actionCounts;

      return analytics;
    } catch (error) {
      console.error('❌ Customer analytics retrieval failed:', error);
      return null;
    }
  }

  /**
   * Product Performance Analytics
   */
  static async getProductAnalytics() {
    try {
      const analytics = {
        total_products: 0,
        products_sold_today: 0,
        top_performing: [],
        category_performance: {},
        inventory_alerts: [],
        conversion_rates: {}
      };

      // Get popular products
      const popularProducts = await redis.zrevrange('analytics:popular_products', 0, 19, 'WITHSCORES');
      analytics.top_performing = this.formatZRangeResults(popularProducts);

      // Get today's product sales
      const today = new Date().toISOString().split('T')[0];
      const todayMetrics = await redis.hgetall(`analytics:daily:${today}`);
      analytics.products_sold_today = parseInt(todayMetrics.products_sold || 0);

      return analytics;
    } catch (error) {
      console.error('❌ Product analytics retrieval failed:', error);
      return null;
    }
  }

  /**
   * Marketing Analytics
   */
  static async getMarketingAnalytics() {
    try {
      const analytics = {
        campaign_performance: [],
        traffic_sources: {},
        conversion_funnel: {},
        search_analytics: {},
        social_media_impact: {}
      };

      // Get search analytics
      const topSearches = await redis.zrevrange('analytics:search_terms', 0, 19, 'WITHSCORES');
      analytics.search_analytics = {
        top_terms: this.formatZRangeResults(topSearches),
        total_searches: topSearches.reduce((sum, [term, count]) => sum + parseInt(count), 0)
      };

      return analytics;
    } catch (error) {
      console.error('❌ Marketing analytics retrieval failed:', error);
      return null;
    }
  }

  /**
   * Performance Metrics
   */
  static async getPerformanceMetrics() {
    try {
      const metrics = {
        response_times: {},
        error_rates: {},
        system_health: {},
        user_satisfaction: {}
      };

      // Get recent performance data
      const performanceData = await redis.lrange('performance_metrics', 0, 99);
      
      if (performanceData.length > 0) {
        const parsed = performanceData.map(data => JSON.parse(data));
        
        // Calculate average response times
        metrics.response_times.average = parsed.reduce((sum, p) => 
          sum + (p.database?.queryTime || 0), 0) / parsed.length;
        
        // Calculate error rates
        const errorData = await redis.lrange('error_history', 0, 99);
        metrics.error_rates.hourly = errorData.length;
      }

      return metrics;
    } catch (error) {
      console.error('❌ Performance metrics retrieval failed:', error);
      return null;
    }
  }

  /**
   * Generate Comprehensive Analytics Report
   */
  static async generateAnalyticsReport(options = {}) {
    try {
      const {
        dateRange = 30,
        includeRealTime = true,
        includeForecasting = false
      } = options;

      console.log('📊 Generating comprehensive analytics report...');

      const report = {
        metadata: {
          generated_at: new Date().toISOString(),
          period: `${dateRange} days`,
          version: '1.0'
        },
        executive_summary: {},
        sales: await this.getSalesAnalytics(dateRange),
        customers: await this.getCustomerAnalytics(),
        products: await this.getProductAnalytics(),
        marketing: await this.getMarketingAnalytics(),
        performance: await this.getPerformanceMetrics()
      };

      if (includeRealTime) {
        report.real_time = await this.getRealTimeDashboard();
      }

      // Generate executive summary
      report.executive_summary = this.generateExecutiveSummary(report);

      console.log('✅ Analytics report generated successfully');
      return report;
    } catch (error) {
      console.error('❌ Analytics report generation failed:', error);
      return null;
    }
  }

  /**
   * Track Active Users
   */
  static async trackActiveUser(userId) {
    try {
      const hour = new Date().toISOString().slice(0, 13);
      await redis.pfadd(`analytics:active_users:${hour}`, userId);
      
      // Also track daily active users
      const day = new Date().toISOString().split('T')[0];
      await redis.pfadd(`analytics:active_users:daily:${day}`, userId);
      
      return true;
    } catch (error) {
      console.error('❌ Active user tracking failed:', error);
      return false;
    }
  }

  /**
   * Helper: Format Redis ZRANGE results
   */
  static formatZRangeResults(results) {
    const formatted = [];
    for (let i = 0; i < results.length; i += 2) {
      formatted.push({
        item: results[i],
        score: parseInt(results[i + 1] || 0)
      });
    }
    return formatted;
  }

  /**
   * Helper: Calculate growth rate
   */
  static calculateGrowthRate(data, field) {
    if (data.length < 2) return 0;
    
    const recent = data.slice(-7); // Last 7 days
    const previous = data.slice(-14, -7); // Previous 7 days
    
    const recentSum = recent.reduce((sum, item) => sum + item[field], 0);
    const previousSum = previous.reduce((sum, item) => sum + item[field], 0);
    
    if (previousSum === 0) return recentSum > 0 ? 100 : 0;
    
    return ((recentSum - previousSum) / previousSum) * 100;
  }

  /**
   * Helper: Generate executive summary
   */
  static generateExecutiveSummary(report) {
    const summary = {
      key_metrics: {},
      insights: [],
      recommendations: []
    };

    // Extract key metrics
    if (report.sales) {
      summary.key_metrics.total_revenue = report.sales.growth_metrics?.total_revenue || 0;
      summary.key_metrics.total_orders = report.sales.growth_metrics?.total_orders || 0;
      summary.key_metrics.revenue_growth = report.sales.growth_metrics?.revenue_growth || 0;
    }

    // Generate insights
    if (summary.key_metrics.revenue_growth > 10) {
      summary.insights.push('Strong revenue growth indicates healthy business expansion');
    } else if (summary.key_metrics.revenue_growth < -10) {
      summary.insights.push('Revenue decline requires immediate attention');
    }

    // Generate recommendations
    if (report.products?.top_performing?.length > 0) {
      summary.recommendations.push('Focus marketing efforts on top-performing products');
    }

    return summary;
  }

  /**
   * Clean up old analytics data
   */
  static async cleanupOldData(retentionDays = 90) {
    try {
      console.log(`🧹 Cleaning up analytics data older than ${retentionDays} days...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      let cleanedCount = 0;
      
      // Clean up daily analytics
      for (let i = retentionDays; i < retentionDays + 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const deleted = await redis.del(`analytics:daily:${dateKey}`);
        if (deleted) cleanedCount++;
      }
      
      // Trim analytics streams
      await redis.xtrim('analytics:user_behavior', 'MAXLEN', '~', 10000);
      await redis.xtrim('analytics:ecommerce', 'MAXLEN', '~', 10000);
      
      console.log(`✅ Cleaned up ${cleanedCount} old analytics records`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Analytics cleanup failed:', error);
      return 0;
    }
  }
}

module.exports = AdvancedAnalytics;
