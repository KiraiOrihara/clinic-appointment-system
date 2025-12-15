import { useState } from 'react';
import { clinicManagerService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ClinicSettings = ({ clinic, settings, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    opening_time: settings?.opening_time || '08:00',
    closing_time: settings?.closing_time || '17:00',
    requires_approval: settings?.requires_approval ?? true,
    advance_booking_days: settings?.advance_booking_days || 30,
    appointment_duration_minutes: settings?.appointment_duration_minutes || 30,
    special_instructions: settings?.special_instructions || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await clinicManagerService.updateSettings(formData);
      setSuccess('Settings updated successfully!');
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinic Settings</CardTitle>
          <CardDescription>
            Configure operating hours, booking rules, and clinic preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-success">{success}</span>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="opening_time">Opening Time</Label>
                <Input
                  id="opening_time"
                  type="time"
                  value={formData.opening_time}
                  onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closing_time">Closing Time</Label>
                <Input
                  id="closing_time"
                  type="time"
                  value={formData.closing_time}
                  onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requires_approval">Require Approval for Appointments</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, all appointments require manager approval
                </p>
              </div>
              <Switch
                id="requires_approval"
                checked={formData.requires_approval}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, requires_approval: checked })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="advance_booking_days">Advance Booking Days</Label>
                <Input
                  id="advance_booking_days"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.advance_booking_days}
                  onChange={(e) => setFormData({ ...formData, advance_booking_days: parseInt(e.target.value) })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  How many days in advance patients can book
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment_duration_minutes">Default Appointment Duration (minutes)</Label>
                <Input
                  id="appointment_duration_minutes"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.appointment_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, appointment_duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                placeholder="Any special instructions or notes for patients..."
                rows={4}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicSettings;

