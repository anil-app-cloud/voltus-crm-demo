import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Communication } from '../../../types';

interface CommunicationsTabProps {
  communications: Communication[];
}

const CommunicationsTab: React.FC<CommunicationsTabProps> = ({ communications }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">All Communications</h2>
      
      <div className="space-y-6">
        {communications.map((comm) => (
          <Card key={comm.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50 p-4 flex flex-row items-center justify-between">
              <div>
                <div className="text-sm font-medium capitalize">{comm.type}</div>
                <div className="text-xs text-muted-foreground">{new Date(comm.date).toLocaleDateString()}</div>
              </div>
              {comm.type === 'email' && (
                <div className="text-right text-sm">
                  <div>From: {comm.from_name} ({comm.from_title})</div>
                  <div>To: {comm.to_name} ({comm.to_title})</div>
                </div>
              )}
              {comm.type === 'call' && (
                <div className="text-right text-sm">
                  <div>Between: {comm.from_name} ({comm.from_title}) and {comm.to_name} ({comm.to_title})</div>
                </div>
              )}
              {comm.type === 'note' && (
                <div className="text-right text-sm">
                  <div>By: {comm.from_name} ({comm.from_title})</div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              {comm.type === 'email' && comm.subject && (
                <div className="mb-2 font-medium">Subject: {comm.subject}</div>
              )}
              
              {comm.type === 'email' ? (
                <div className="whitespace-pre-line">{comm.content}</div>
              ) : comm.type === 'call' ? (
                <div>
                  <div className="mb-2"><strong>Call Duration:</strong> {comm.duration_minutes} minutes</div>
                  <div><strong>Summary:</strong> {comm.summary}</div>
                </div>
              ) : (
                <div>{comm.content}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunicationsTab; 