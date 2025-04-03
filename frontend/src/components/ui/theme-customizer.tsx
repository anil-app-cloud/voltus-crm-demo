import React from 'react';
import { Paintbrush, Check } from 'lucide-react';
import { Button } from './button';
import { Dropdown } from './dropdown';
import { useTheme, predefinedColors } from '../../lib/theme';

export function ThemeCustomizer() {
  const { primaryColor, setPrimaryColor } = useTheme();

  const colorNames = Object.keys(predefinedColors) as Array<keyof typeof predefinedColors>;

  const getColorVariables = (hsl: string) => {
    return { '--primary': hsl };
  };

  const getCurrentColorName = () => {
    return colorNames.find(
      name => predefinedColors[name] === primaryColor
    ) || 'custom';
  };

  return (
    <Dropdown
      trigger={
        <Button variant="ghost" size="icon" className="h-9 w-9 relative border border-gray-200 dark:border-gray-700">
          <Paintbrush 
            className="h-[1.2rem] w-[1.2rem] text-primary" 
            style={{ 
              // Apply gradient to make it more colorful
              stroke: `hsl(${primaryColor})` 
            }} 
          />
          <span className="sr-only">Customize theme</span>
        </Button>
      }
      align="end"
      width={220}
    >
      <div className="p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          Color Theme
        </div>
        <div className="grid grid-cols-3 gap-2">
          {colorNames.map(colorName => {
            const color = predefinedColors[colorName];
            const isActive = primaryColor === color;
            
            return (
              <button
                key={colorName}
                className={`relative flex h-8 cursor-pointer rounded-md p-1 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isActive ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                style={getColorVariables(color) as React.CSSProperties}
                onClick={() => setPrimaryColor(color)}
              >
                <div className="absolute inset-0 rounded-md bg-primary opacity-10"></div>
                <div className="flex h-full w-full items-center justify-center rounded">
                  {isActive ? <Check className="h-4 w-4 text-white" /> : null}
                </div>
                <span className="sr-only">{colorName}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Selected: <span className="font-medium capitalize">{getCurrentColorName()}</span>
        </div>
      </div>
    </Dropdown>
  );
} 