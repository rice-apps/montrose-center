
import type { Resource } from "@/components/ResourceTable";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type Contact = {
    person_id: string;
    person_name: string | null;
    person_email: string | null;
    person_phone: string | null;
    person_team: string | null;
    person_service_description: string | null;
};

export type ServiceDetail = Resource & {
    keywords: string;
    is_active: boolean;
    target_population: string | null;
    eligibility: string | null;
    referral_instruction: string | null;
    contacts: Contact[];
};


export async function getServices(
    query: string = "",
    limit: number = 10,
    offset: number = 0
): Promise<Resource[]> {
    const params = new URLSearchParams();

    params.set("limit", String(limit));
    params.set("offset", String(offset));

    if (query.trim()) {
        params.set("q", query.trim());
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/services?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load services (status ${response.status}).`
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Unable to connect to the catalog API.");
        }

        throw error;
    }
}

export async function getServiceDetails(
    serviceId: string
): Promise<ServiceDetail> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/services/${encodeURIComponent(serviceId)}`
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Service not found.");
            }

            throw new Error(
                `Failed to load service details (status ${response.status}).`
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Unable to connect to the catalog API.");
        }

        throw error;
    }
}
