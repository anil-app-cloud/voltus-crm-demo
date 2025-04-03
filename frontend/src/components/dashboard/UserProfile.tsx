import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Clock, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getUserProfile } from '../../lib/api';

interface UserProfileProps {
  minimal?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ minimal = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getUserProfile();
        setUserProfile(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4" data-testid="loading-animation">
            <div className="rounded-full bg-slate-200 h-14 w-14"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) return null;

  if (minimal) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              <img 
                src={userProfile.avatar} 
                alt={`${userProfile.first_name} ${userProfile.last_name}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{userProfile.first_name} {userProfile.last_name}</h3>
              <p className="text-sm text-muted-foreground">{userProfile.title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Profile</CardTitle>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
              <img 
                src={userProfile.avatar} 
                alt={`${userProfile.first_name} ${userProfile.last_name}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-lg">{userProfile.first_name} {userProfile.last_name}</h3>
            <p className="text-muted-foreground">{userProfile.title}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">{userProfile.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">{userProfile.phone}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">Joined {formatDate(userProfile.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm">Last login {formatDate(userProfile.last_login)}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Recent Activities</h4>
              <div className="space-y-3">
                {userProfile.recent_activities && userProfile.recent_activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start">
                    <div className={`p-1 rounded-md mr-3 ${
                      activity.type === 'booking' ? 'bg-blue-100 text-blue-800' :
                      activity.type === 'invoice' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile; 