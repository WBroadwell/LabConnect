export interface OpportunityCreator {
  id: number;
  name: string;
  email: string;
  title?: string;
  departments: string[];
}

export interface Opportunity {
  id: string;
  name: string;
  title: string;
  application_due: string;
  type: string;
  hourlyPay: number;
  credits: string[];
  description: string;
  recommended_experience: string;
  location: string;
  years: string[];
  created_at: string;
  created_by_id: number | null;
  creator?: OpportunityCreator;
}
