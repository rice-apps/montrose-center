export type UUID = `${string}-${string}-${string}-${string}-${string}`;

/** Fields returned in search results and rendered by ServiceCard. */
export interface ServiceSummary {
  service_id: UUID;
  name: string;
  description: string;
  resource_type: "internal" | "external";
  program_name: string | null;
  target_population: string | null;
}

export interface Contact {
  person_id: UUID;
  person_name: string | null;
  person_email: string | null;
  person_phone: string | null;
  person_team: string | null;
  person_service_description: string | null;
}

/** Full record returned by the service detail endpoint. */
export interface ServiceDetail extends ServiceSummary {
  keywords: string[];
  is_active: boolean;
  eligibility: string | null;
  referral_instruction: string | null;
  resource_category: string | null; // NEW – confirm with API
  program_url: string | null;       // NEW – confirm with API
  contacts: Contact[];              // [] when there are none
}

// sample data

export const sampleServices: ServiceSummary[] = [
  {
    service_id: "a1b2c3d4-0000-4000-8000-000000000001",
    name: "Food Pantry",
    description: "Weekly groceries for families in need.",
    resource_type: "internal",
    program_name: "Community Nutrition",
    target_population: "Families",
  },
  {
    service_id: "a1b2c3d4-0000-4000-8000-000000000002",
    name: "Legal Aid Clinic",
    description: "Free legal consultations for housing and benefits issues.",
    resource_type: "external",
    program_name: "Housing Justice Project",
    target_population: "Adults",
  },
  {
    service_id: "a1b2c3d4-0000-4000-8000-000000000003",
    name: "Youth Counseling",
    description: "Short-term counseling for young people and their families.",
    resource_type: "internal",
    program_name: "Youth Services",
    target_population: "Ages 12–24",
  },
];