import React, { useState, useEffect } from 'react';
import { Truck, Plane, Ship, Train, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface TransportModeReportProps {
  transportModes?: Array<{ mode: string; percentage: number }>;
  className?: string;
}

const TransportModeReport: React.FC<TransportModeReportProps> = ({ 
  transportModes = [],
  className 
}) => {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    
    if (transportModes.length) {
      const initialValues: { [key: string]: number } = {};
      transportModes.forEach(mode => {
        initialValues[mode.mode] = 0;
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
        transportModes.forEach(mode => {
          newValues[mode.mode] = Math.min(Math.floor(mode.percentage * progress), mode.percentage);
        });
        
        setAnimatedValues(newValues);
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [transportModes]);

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'sea':
        return <Ship className="h-5 w-5 text-blue-500" />;
      case 'air':
        return <Plane className="h-5 w-5 text-sky-500" />;
      case 'road':
        return <Truck className="h-5 w-5 text-green-500" />;
      case 'rail':
        return <Train className="h-5 w-5 text-amber-500" />;
      default:
        return <Truck className="h-5 w-5 text-gray-500" />;
    }
  };

  const colors = {
    Sea: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      light: 'bg-blue-100',
      gradient: 'from-blue-500 to-sky-400'
    },
    Air: {
      bg: 'bg-sky-500',
      text: 'text-sky-600',
      light: 'bg-sky-100',
      gradient: 'from-sky-500 to-indigo-400'
    },
    Road: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      light: 'bg-green-100',
      gradient: 'from-green-500 to-emerald-400'
    },
    Rail: {
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      light: 'bg-amber-100',
      gradient: 'from-amber-500 to-yellow-400'
    }
  };

  if (!transportModes.length) {
    return (
      <Card className={`${className} shadow-md hover:shadow-lg transition-all duration-300`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BarChart className="mr-2 h-5 w-5 text-primary" />
            Transport Modes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground animate-pulse">
            <Truck className="h-12 w-12 mx-auto mb-3 text-muted" />
            <p>No transport mode data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-md hover:shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <CardHeader className="pb-2 border-b bg-muted/30">
        <CardTitle className="text-lg flex items-center">
          <BarChart className="mr-2 h-5 w-5 text-primary" />
          Transport Modes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {transportModes.map((mode, index) => (
            <div 
              key={mode.mode}
              className="relative flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 group animate-scale-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`absolute -top-3 left-3 rounded-full p-2 ${colors[mode.mode as keyof typeof colors]?.light || 'bg-gray-100'}`}>
                {getModeIcon(mode.mode)}
              </div>
              <div className="mt-3">
                <div className="text-center">
                  <h4 className={`text-xl font-bold ${colors[mode.mode as keyof typeof colors]?.text || 'text-gray-700'}`}>
                    {animatedValues[mode.mode] || 0}%
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{mode.mode}</p>
                </div>
                <div 
                  className="mt-3 w-full h-2 bg-muted rounded-full overflow-hidden" 
                  aria-label={`${mode.mode}: ${mode.percentage}%`}
                >
                  <div
                    className={`h-full bg-gradient-to-r ${colors[mode.mode as keyof typeof colors]?.gradient || 'from-primary to-primary-foreground'} transition-all duration-1000 ease-out`}
                    style={{ width: `${animatedValues[mode.mode] || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Distribution Summary</h4>
          <div className="h-8 w-full flex rounded-md overflow-hidden">
            {transportModes.map((mode, index) => (
              <div 
                key={mode.mode}
                className={`${colors[mode.mode as keyof typeof colors]?.bg || 'bg-gray-400'} transition-all duration-1000 ease-out relative group`}
                style={{ width: `${animatedValues[mode.mode] || 0}%` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs text-white font-bold">{mode.mode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransportModeReport; 