
export type ViewType = 'tracker' | 'family' | 'automation' | 'report' | 'settings';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  lat: number;
  lng: number;
  lastSeen: string;
  status: 'home' | 'moving' | 'away' | 'offline';
  avatarColor: string;
  avatarIcon: string; 
}

export interface AutomationRule {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  triggerMemberIds: string[]; // List of IDs or ['all']
  receiverMemberIds: string[]; // List of IDs or ['all']
  message: string;
  enabled: boolean;
}

export interface BroadcastMessage {
  id: string;
  senderId: string;
  senderName: string;
  type: 'arrived' | 'on_road' | 'location' | 'automation';
  timestamp: string;
  mapLink?: string;
  targetMemberIds?: string[]; // Who should actually care about this
}

export interface FamilyState {
  familyId: string;
  familyName: string;
  members: FamilyMember[];
  automations: AutomationRule[];
}

export type SyncEvent = 
  | { type: 'LOCATION_UPDATE'; memberId: string; lat: number; lng: number }
  | { type: 'STATUS_UPDATE'; report: BroadcastMessage }
  | { type: 'MEMBER_JOINED'; member: FamilyMember }
  | { type: 'MEMBER_UPDATED'; member: FamilyMember }
  | { type: 'AUTOMATIONS_UPDATE'; automations: AutomationRule[] };
