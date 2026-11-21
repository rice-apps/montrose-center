import type { ServiceDetail } from "@/components/Service";
import styles from "./ServiceDetails.module.css";

interface ServiceDetailPanelProps {
  service: ServiceDetail;
  id?: string; // matches the card's controlsId
}

const Dot = () => <span className={styles.dot} aria-hidden="true">·</span>;

export function ServiceDetailPanel({ service, id }: ServiceDetailPanelProps) {
  const meta = [
    service.resource_type === "internal" ? "Internal resource" : "External resource",
    service.resource_category,
  ].filter(Boolean);

  const contact = service.contacts[0]; // design shows one primary contact

  return (
    <section id={id} className={styles.panel} aria-label={`${service.name} details`}>
      <div className={styles.content}>
        <h3 className={styles.label}>About this program</h3>
        <p className={styles.summary}>{service.description}</p>

        <p className={styles.meta}>{meta.join(" · ")}</p>

        {service.eligibility && (
          <div className={styles.block}>
            <h4 className={styles.heading}>Eligibility</h4>
            <p className={styles.body}>{service.eligibility}</p>
          </div>
        )}

        {service.referral_instruction && (
          <div className={styles.block}>
            <h4 className={styles.heading}>Referral instructions</h4>
            <p className={styles.body}>{service.referral_instruction}</p>
          </div>
        )}

        {service.program_url && (
          <a className={styles.link} href={service.program_url} target="_blank" rel="noopener noreferrer">
            Program link
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>

      {contact && (
        <div className={styles.footer}>
          <p>
            Contact
            <span className={styles.contactName}>{contact.person_name ?? "Unnamed contact"}</span>
            {contact.person_service_description && (<><Dot />{contact.person_service_description}</>)}
          </p>
          {(contact.person_email || contact.person_phone) && (
            <p>
              {contact.person_email && <a href={`mailto:${contact.person_email}`}>{contact.person_email}</a>}
              {contact.person_email && contact.person_phone && <Dot />}
              {contact.person_phone && <a href={`tel:${contact.person_phone}`}>{contact.person_phone}</a>}
            </p>
          )}
        </div>
      )}
    </section>
  );
}