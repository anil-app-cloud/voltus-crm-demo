import React, { useState, useEffect } from 'react';
import { MapPin, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface DestinationsReportCardProps {
  destinations?: Array<{ name: string; count: number }>;
  className?: string;
}

const DestinationsReportCard: React.FC<DestinationsReportCardProps> = ({ 
  destinations = [],
  className
}) => {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    if (destinations.length) {
      const initialValues: { [key: string]: number } = {};
      destinations.forEach(dest => {
        initialValues[dest.name] = 0;
      });
      setAnimatedValues(initialValues);
      
      const duration = 1500; // Animation duration in ms
      const interval = 20; // Update interval in ms
      const steps = duration / interval;
      
      let step = 0;
      const timer = setInterval(() => {
        step += 1;
        const progress = step / steps;
        
        const newValues: { [key: string]: number } = {};
        destinations.forEach(dest => {
          newValues[dest.name] = Math.min(Math.floor(dest.count * progress), dest.count);
        });
        
        setAnimatedValues(newValues);
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [destinations]);

  if (!destinations.length) {
    return (
      <Card className={`${className} shadow-md hover:shadow-lg transition-all duration-300`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Globe className="mr-2 h-5 w-5 text-primary" />
            Popular Destinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground animate-pulse">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-muted" />
            <p>No destination data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...destinations.map(d => d.count));
  const getDestinationColor = (index: number) => {
    const colors = [
      'bg-blue-500 text-blue-100', 
      'bg-emerald-500 text-emerald-100', 
      'bg-amber-500 text-amber-100', 
      'bg-purple-500 text-purple-100',
      'bg-indigo-500 text-indigo-100',
      'bg-rose-500 text-rose-100',
      'bg-teal-500 text-teal-100',
      'bg-orange-500 text-orange-100'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className={`${className} shadow-md hover:shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <CardHeader className="pb-2 border-b bg-muted/30">
        <CardTitle className="text-lg flex items-center">
          <Globe className="mr-2 h-5 w-5 text-primary" />
          Popular Destinations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {destinations.map((destination, index) => (
          <div 
            key={destination.name} 
            className={`animate-slide-in-right space-y-2 border-l-4 pl-4 pr-2 py-3 rounded-r-md hover:shadow-md transition-all duration-200 ${index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}
            style={{ 
              animationDelay: `${index * 100}ms`,
              borderLeftColor: `var(--${index % 2 === 0 ? 'primary' : 'secondary'})` 
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{destination.name}</span>
              </div>
              <div className="flex items-center">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDestinationColor(index)}`}>
                  {animatedValues[destination.name] || 0}
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${(animatedValues[destination.name] / maxCount) * 100}%`,
                  background: `linear-gradient(90deg, var(--${index % 2 === 0 ? 'primary' : 'secondary'}) 0%, var(--${index % 2 === 0 ? 'secondary' : 'primary'}) 100%)` 
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DestinationsReportCard; 