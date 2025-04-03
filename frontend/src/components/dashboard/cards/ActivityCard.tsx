import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { RefreshCw } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
  user?: string;
}

interface ActivityCardProps {
  className?: string;
  activities: Activity[];
  error?: string | null;
  onRetry?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  className,
  activities,
  error,
  onRetry
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-destructive mb-4">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start justify-between">
              <div>
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.user && `${activity.user} • `}{formatDate(activity.date)}
                </p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard; 