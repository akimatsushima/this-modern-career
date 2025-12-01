export interface LayerConfig {
  id: number;
  name: string;
  capacity: number;
  color: string;
  size: number;
}

export interface Agent {
  id: number;
  layerId: number;
  slotIdx: number;
  stage: number;
  merit: number;
  isUser: boolean;
  isPeer: boolean;
  status: 'active' | 'retired' | 'dead';
  isNew?: boolean; // Track if agent was just hired for animation
}

export interface SlotCoordinate {
  top: number;
  left: number;
}

export interface SimConfig {
  luck: number; // 0 to 1
  userMerit: number; // 0 to 1
}