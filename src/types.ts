export interface DisposalInfo {
  itemName: string;
  category: string;
  isRecyclable: boolean;
  instructions: string;
  environmentalImpact: string;
  alternatives: string[];
  ecoScore: number; // 1-100
  upcyclingIdeas: string[];
  harmfulnessScore: number; // 1-10 (10 being most harmful)
  recyclingDuration: string; // e.g., "3-6 months", "Indefinite"
  disposalRecommendations: {
    method: string;
    locationType: string;
    preparation: string;
  };
}

export interface MaterialInfo {
  name: string;
  composition: string;
  recyclabilityRate: string;
  environmentalImpact: string;
  decompositionTime: string;
  specializedProcess: string;
  commonUses: string[];
  funFact: string;
}

export interface RecyclingCenter {
  name: string;
  address: string;
  distance?: string;
  types: string[];
  url?: string;
}
