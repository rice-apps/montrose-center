import type { ReactElement } from "react";

export interface Contact {
    person_id: string;
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
    contacts: Contact[]
}

interface ServiceCardProps {
    service: ServiceSummary;
    index: number; 
    onSelect: (service: ServiceSummary) => void;
    isSelected?: boolean;
}

//card
export function ServiceCard({ service, index, onSelect, isSelected = false }: ServiceCardProps) {
    
    const number = String(index + 1).padStart(2, "0");

    const typeLabel = service.resource_type === "internal" ? "Internal" : "External";
    return(
        //card container
        
        <button
            type="button"
            onClick={() => onSelect(service)}
            aria-expanded ={isSelected}
            className="flex h-14 w-full max-w-[692px] items-center gap-0 rounded-xl border border-neutral-200 bg-white p-0 text-left hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
                    
            {/* badge slot */}
            <div className="flex w-14 h-full shrink-0 items-center justify-center">
                <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 p-1 font-[Inter] text-base font-semibold leading-[22px] tracking-normal text-neutral-700">
                    number placeholder {number}
                </span>
            </div>
    

            {/* the text inside the row  */}
            <span className="flex min-w-0 flex-1 flex-col">

                {/*the name of program*/}
                <span className="flex min-w-0 items-center gap-2">
                    <span className=" text-sm font-medium leading-5 text-neutral-900">
                        {service.name}
                    </span>

                    {/*internal or external label ??*/}
                    {typeLabel}
                </span>

                {/*desc*/}
                <span className="truncate text-sx leading-4 text-neutral-500">
                    {service.program_name && (
                        <span className="font-medium text-neutral-700">
                            {service.program_name}
                        </span>
                    )}

                    {service.description}
                </span>
            </span>
            
            <span className="flex h-full w-14 shrink-0 items-center justify center">
                <span
                    aria-hidden
                    className="flex size-8 items-center justify-center gap-0 rounded-lg bg-neutral-100 p-1">
                    
                    <svg
                        viewBox="0 0 20 20"
                        className={'size-6 transition-transform ${isSelected ? "rotate-180" : ""}'}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                     >
                    
                    <path d="M5 815 5 5-5" strokeLinecap="round" strokeLinejoin="round" />

                    </svg>   
                </span>
            </span>
        </button>

    );
}

