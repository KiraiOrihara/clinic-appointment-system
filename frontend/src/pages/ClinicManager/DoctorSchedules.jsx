import { useState, useEffect } from 'react';
import { clinicManagerService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const DoctorSchedules = ({ clinicId }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await clinicManagerService.getDoctorSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedules...</p>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Schedules</CardTitle>
          <CardDescription>
            Manage doctor availability and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No schedules configured</p>
              <p className="text-sm text-muted-foreground mt-2">
                Doctor schedule management will be available soon
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {schedule.doctor?.user?.first_name} {schedule.doctor?.user?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {daysOfWeek[schedule.day_of_week]} • {schedule.start_time} - {schedule.end_time}
                        </p>
                      </div>
                      {schedule.is_available ? (
                        <span className="text-sm text-green-600">Available</span>
                      ) : (
                        <span className="text-sm text-red-600">Unavailable</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSchedules;

