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
}
