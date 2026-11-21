"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceDetailPanel } from "@/components/ServiceDetails";
import { sampleServices, type ServiceDetail, type ServiceSummary, type UUID } from "@/components/Service";
import styles from "./page.module.css";

const steps =
  "1. Check eligibility requirements.\n2. Complete the referral form with consent.\n3. Contact the coordinator for next steps.";


const details: Record<string, ServiceDetail> = Object.fromEntries(
  sampleServices.map((s, i) => [
    s.service_id,
    {
      ...s,
      keywords: [],
      is_active: true,
      eligibility: null,
      referral_instruction: steps,
      resource_category: "Basic needs",
      program_url: "https://example.org",
      contacts:
        i === 1
          ? [] // shows the "no contacts" case
          : [
              {
                person_id: "3f2a7c1e-8b4d-4e6a-9c2f-1a5b7d9e0c31",
                person_name: "Jane Doe",
                person_email: "contact@example.org",
                person_phone: "555-0100",
                person_team: null,
                person_service_description: "Program coordinator",
              },
            ],
    },
  ])
);

export default function ServiceCardPreview() {
  const [selectedId, setSelectedId] = useState<UUID | null>(null);
  const selectedService = sampleServices.find((s) => s.service_id === selectedId);

  const toggle = (service: ServiceSummary) =>
    setSelectedId((cur) => (cur === service.service_id ? null : service.service_id));

  return (
    <main className={styles.page}>
      <h1>ServiceCard preview</h1>

      <div className={styles.list}>
        {sampleServices.map((service, index) => {
          const isOpen = service.service_id === selectedService?.service_id;
          const panelId = `service-detail-${service.service_id}`;
          const detail = details[service.service_id];

          return (
            <div key={service.service_id}>
              <ServiceCard
                service={service}
                index={index}
                onSelect={toggle}
                isSelected={isOpen}
                controlsId={panelId}
              />
              {isOpen && detail && <ServiceDetailPanel id={panelId} service={detail} />}
            </div>
          );
        })}
      </div>

      {/* Placeholder actions: these belong to the chat page, not the card */}
      <div className={styles.actions}>
        <button type="button" className={styles.action}>Compare these</button>
        <button type="button" className={styles.action}>Show more options</button>
      </div>
    </main>
  );
}