import type { ReactElement, ReactNode } from "react";
import styles from "./ServiceCard.module.css";
import { UUID } from "crypto";


export interface Contact {
    person_id: UUID;
    service_id: UUID;
    person_name: string | null;
    person_email: string | null;
    person_phone: string | null;
    person_team: string | null;
    person_service_desc: string | null;
}

export interface ServiceSummary{
    service_id: string;
    name: string;
    description: string;
    keywords: string[];
    is_active: boolean
    resource_type: 'internal' | 'external';
    program_name: string | null;
    target_population: string | null;
    eligibility: string | null;
    referral_instruction: string | null;
    contacts: Contact[] | null;
}

export interface ServiceCardProps {
  service: ServiceSummary; // the service to show
  index: number; // position in the list (0, 1, 2…), shown as 01, 02, 03
  onSelect: (service: ServiceSummary) => void; // called when the card is clicked
  isSelected?: boolean; // true = card is open (arrow points up, details show)
  children?: ReactNode; // what to show inside the card when it's open
}

//card
export function ServiceCard({ service, index, onSelect, isSelected = false, children }: ServiceCardProps) {
    
    const number = String(index + 1).padStart(2, "0");

    const typeLabel = service.resource_type === "internal" ? "Internal" : "External";
    return(
      <article className={styles.card}>
      {/* The 56px row; the whole row is one button, so clicking anywhere selects it */}
      <button
        type="button"
        className={styles.row}
        onClick={() => onSelect(service)}
        aria-expanded={isSelected} // tells screen readers if the card is open
      >
        {/* Number badge: 32×32, 8px corners, Inter SemiBold 16/22 */}
        <span className={styles.badgeSlot}>
          <span className={styles.badge}>{number}</span>
        </span>

        {/* Text: name + internal/external label on top, program · description below */}
        <span className={styles.text}>
          <span className={styles.titleLine}>
            <span className={styles.title}>{service.name}</span>
            <span className={service.resource_type === "internal" ? styles.internal : styles.external}>
              {service.resource_type === "internal" ? "Internal" : "External"}
            </span>
          </span>
          <span className={styles.subtitle}>
            {/* Program only shows when it's not null */}
            {service.program_name && <span className={styles.program}>{service.program_name} · </span>}
            {service.description}
          </span>
        </span>

        {/* Arrow box: 32×32, 8px corners; arrow flips up when open */}
        <span className={styles.chevronSlot}>
          <span className={styles.chevron} aria-hidden>
            <svg
              viewBox="0 0 20 20"
              width="20"
              height="20"
              className={isSelected ? styles.flipped : undefined}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </button>

      {/* Open area: only shows when the card is selected */}
      {isSelected && <div className={styles.details}>{children}</div>}
    </article>
  );
}

