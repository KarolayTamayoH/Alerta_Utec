export interface Incident {
  id: string;
  type: 'medical' | 'security' | 'infrastructure' | 'other';
  area: string;
  title: string;
  description: string;
  location: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  email?: string;
  userId?: string;
  reportedBy?: string;
}
