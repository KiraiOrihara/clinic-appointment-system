import { useState, useEffect } from 'react';
import { clinicManagerService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const Analytics = ({ clinicId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await clinicManagerService.getAnalytics({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Reports</CardTitle>
          <CardDescription>
            View appointment statistics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Appointments by Status</h3>
                <div className="space-y-2">
                  {analytics.appointments_by_status?.map((stat) => (
                    <div key={stat.status} className="flex justify-between">
                      <span className="capitalize">{stat.status.replace('_', ' ')}</span>
                      <span className="font-medium">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Appointments by Service</h3>
                <div className="space-y-2">
                  {analytics.appointments_by_service?.map((stat) => (
                    <div key={stat.service} className="flex justify-between">
                      <span>{stat.service}</span>
                      <span className="font-medium">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No analytics data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

