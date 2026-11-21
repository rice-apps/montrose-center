import type { ServiceSummary } from "@/components/Service";
import styles from "./ServiceCard.module.css";

interface ServiceCardProps {
  service: ServiceSummary;
  index: number;          // position in the list (0, 1, 2…), shown as 01, 02, 03
  onSelect: (service: ServiceSummary) => void;
  isSelected?: boolean;   // true = detail is open (chevron points up)
  controlsId?: string;    // id of the detail panel this card opens
}

export function ServiceCard({ service, index, onSelect, isSelected = false, controlsId }: ServiceCardProps) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onSelect(service)}
      aria-expanded={isSelected}
      aria-controls={controlsId}
    >
      <span className={styles.index} aria-hidden="true">{number}</span>

      <span className={styles.text}>
        <span className={styles.name}>{service.name}</span>
        {service.program_name && <span className={styles.subtitle}>{service.program_name}</span>}
      </span>

      <span className={styles.chevron} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>
  );
}