'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiPhoneCall, FiClock, FiUser, FiLoader, FiPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PhoneCall {
  id: string;
  contactName: string;
  phoneNumber: string;
  purpose: string;
  duration: string;
  status: 'scheduled' | 'completed' | 'missed' | 'in-progress';
  scheduledTime?: Date;
  completedTime?: Date;
  notes?: string;
}

interface PhoneCallsViewProps {
  onMakeCall: (contactName: string, phoneNumber: string, purpose: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function PhoneCallsView({ onMakeCall, isLoading, className }: PhoneCallsViewProps) {
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [calls, setCalls] = useState<PhoneCall[]>([
    {
      id: '1',
      contactName: 'John Smith',
      phoneNumber: '+1 (555) 123-4567',
      purpose: 'Follow up on project proposal',
      duration: '15:30',
      status: 'completed',
      completedTime: new Date(Date.now() - 3600000),
      notes: 'Discussed timeline and budget. Client interested in moving forward.'
    },
    {
      id: '2',
      contactName: 'Sarah Johnson',
      phoneNumber: '+1 (555) 987-6543',
      purpose: 'Schedule meeting for next week',
      duration: '8:45',
      status: 'scheduled',
      scheduledTime: new Date(Date.now() + 86400000),
      notes: 'Initial contact to discuss partnership opportunities.'
    }
  ]);

  const callPurposes = [
    'Business Meeting',
    'Customer Support',
    'Sales Follow-up',
    'Project Discussion',
    'Technical Support',
    'Partnership Discussion',
    'Interview',
    'Consultation',
    'Other'
  ];

  const quickContacts = [
    { name: 'Support Team', number: '+1 (555) 000-1111' },
    { name: 'Sales Department', number: '+1 (555) 000-2222' },
    { name: 'Emergency Line', number: '+1 (555) 000-3333' }
  ];

  const handleMakeCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !phoneNumber.trim() || !purpose.trim() || isLoading) return;

    const newCall: PhoneCall = {
      id: Date.now().toString(),
      contactName,
      phoneNumber,
      purpose,
      duration: '00:00',
      status: 'in-progress',
      notes: ''
    };

    setCalls(prev => [newCall, ...prev]);
    onMakeCall(contactName, phoneNumber, purpose);
    setContactName('');
    setPhoneNumber('');
    setPurpose('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiPhoneCall className="w-4 h-4" />;
      case 'scheduled': return <FiClock className="w-4 h-4" />;
      case 'in-progress': return <FiPhone className="w-4 h-4 animate-pulse" />;
      case 'missed': return <FiPhone className="w-4 h-4" />;
      default: return <FiPhone className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Make Call Form */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FiPhone className="w-5 h-5" />
          Make a Phone Call
        </h3>
        <form onSubmit={handleMakeCall} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Call
            </label>
            <Select value={purpose} onValueChange={setPurpose} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select the purpose of this call..." />
              </SelectTrigger>
              <SelectContent>
                {callPurposes.map(purpose => (
                  <SelectItem key={purpose} value={purpose}>
                    {purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            disabled={!contactName.trim() || !phoneNumber.trim() || !purpose.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <FiLoader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FiPhone className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Connecting...' : 'Make Call'}
          </Button>
        </form>
      </div>

      {/* Quick Contacts */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Contacts</h4>
        <div className="flex flex-wrap gap-2">
          {quickContacts.map((contact, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setContactName(contact.name);
                setPhoneNumber(contact.number);
                setPurpose('Business Discussion');
              }}
              className="h-auto p-2"
            >
              <div className="text-left">
                <div className="font-medium text-xs">{contact.name}</div>
                <div className="text-xs text-gray-500">{contact.number}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Call History</h3>
        
        <div className="space-y-3">
          {calls.map((call, index) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(call.status).replace('text-', 'text-white ').replace('bg-', 'bg-')}`}>
                      {getStatusIcon(call.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{call.contactName}</h4>
                        <Badge className={getStatusColor(call.status)} variant="secondary">
                          {call.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1">{call.phoneNumber}</p>
                      <p className="text-sm text-gray-800 mb-2">{call.purpose}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {call.duration}
                        </span>
                        {call.scheduledTime && (
                          <span>Scheduled: {call.scheduledTime.toLocaleString()}</span>
                        )}
                        {call.completedTime && (
                          <span>Completed: {call.completedTime.toLocaleString()}</span>
                        )}
                      </div>
                      
                      {call.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Notes:</strong> {call.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {call.status === 'scheduled' && (
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {calls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiPhone className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
            <p className="text-gray-600">Make your first call using the form above</p>
          </div>
        )}
      </div>
    </div>
  );
}