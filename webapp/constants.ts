import { LayerConfig } from "./types";

export const LAYERS: LayerConfig[] = [
    { id: 5, name: "Chief Exec Level", capacity: 3, color: "bg-purple-900", size: 6 },
    { id: 4, name: "Exec Level", capacity: 15, color: "bg-indigo-900", size: 6 },
    { id: 3, name: "Senior Manager", capacity: 75, color: "bg-blue-900", size: 6 },
    { id: 2, name: "Manager", capacity: 375, color: "bg-teal-900", size: 6 },
    { id: 1, name: "Individual Contributor", capacity: 1875, color: "bg-slate-800", size: 6 } 
];

export const INITIAL_DISTRIBUTION: Record<number, Record<number, number>> = {
    5: {4: 3},                    
    4: {4: 12, 3: 3},             
    3: {4: 54, 3: 15, 2: 6},      
    2: {1: 45, 2: 87, 3: 87, 4: 156}, 
    1: {0: 450, 1: 414, 2: 375, 3: 336, 4: 300} 
};

export const MAX_CAREER_STAGE = 4;
export const PHASE_DELAY = 1600;