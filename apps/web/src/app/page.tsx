"use client";

import { useState } from "react";
import { ServiceCard, type ServiceSummary } from "../components/ServiceCard";

// Sample data so the card has something to show
const sampleServices: ServiceSummary[] = [
  {
    service_id: "3f6c1a2e-8b1d-4c5e-9a7f-1d2e3f4a5b6c",
    name: "Career Coaching",
    description: "One-on-one sessions to plan next steps and build a resume.",
    keywords: ["career", "resume"],
    is_active: true,
    resource_type: "internal",
    program_name: "Workforce Readiness",
    target_population: null,
    eligibility: null,
    referral_instruction: null,
    contacts: null,
   
  },
  {
    service_id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
    name: "Community Food Pantry",
    description: "Weekly groceries for households in the county.",
    keywords: ["food"],
    is_active: true,
    resource_type: "external",
    program_name: null, // missing program
    target_population: null,
    eligibility: null,
    referral_instruction: null,
    contacts: null,
  },
];

export default function Page() {
  // Which card is open; null = none
  const [selected, setSelected] = useState<ServiceSummary | null>(null);

  return (
    // Stacks the cards with an 8px gap, like the Figma
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 692 }}>
      {sampleServices.map((service, i) => {
        const isSelected = selected?.service_id === service.service_id;
        return (
          <ServiceCard
            key={service.service_id}
            service={service}
            index={i}
            isSelected={isSelected}
            onSelect={() => setSelected(isSelected ? null : service)}
          >
            {/* What shows inside the card when it's open */}
            {service.description}
          </ServiceCard>
        );
      })}
    </div>
  );
}