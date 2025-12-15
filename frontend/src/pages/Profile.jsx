import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock } from "lucide-react";

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    address: ""
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      console.log('Profile response status:', response.status);
      console.log('Profile response data:', data);
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, redirect to login
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.error || `Failed to fetch profile data: ${response.status}`);
      }
      
      // Transform backend data to frontend format
      const dateOfBirth = data.dateOfBirth || data.date_of_birth;
      const formattedDate = dateOfBirth 
        ? (typeof dateOfBirth === 'string' ? dateOfBirth.split('T')[0] : dateOfBirth)
        : "";
      
      setProfileData({
        firstName: data.firstName || data.first_name || "",
        lastName: data.lastName || data.last_name || "",
        email: data.email || "",
        dateOfBirth: formattedDate,
        address: data.address || ""
      });
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      alert('Error loading profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          dateOfBirth: profileData.dateOfBirth || null,
          address: profileData.address || null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || (typeof data.error === 'object' ? JSON.stringify(data.error) : 'Failed to save profile');
        throw new Error(errorMessage);
      }
      
      // Update local state with response data
      if (data.firstName || data.first_name) {
        setProfileData(prev => ({
          ...prev,
          firstName: data.firstName || data.first_name,
          lastName: data.lastName || data.last_name,
          email: data.email,
          dateOfBirth: data.dateOfBirth ? (data.dateOfBirth.split('T')[0] || data.dateOfBirth) : '',
          address: data.address || ''
        }));
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target);
    const currentPassword = formData.get('current-password');
    const newPassword = formData.get('new-password');
    const confirmPassword = formData.get('confirm-password');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields!');
      setIsLoading(false);
      return;
    }
    
    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long!');
      setIsLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || (typeof data.error === 'object' ? JSON.stringify(data.error) : 'Failed to change password');
        throw new Error(errorMessage);
      }
      
      e.target.reset();
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to update password: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profileData.email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        placeholder="Enter your address"
                      />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" name="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" name="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" name="confirm-password" type="password" />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
};

export default Profile;
