
"use client";

import { useState } from "react";
import ResourceTable, { type Resource } from "@/components/ResourceTable";

const sampleResources: Resource[] = [
    {
        service_id: "1",
        name: "Housing Assistance",
        program_name: "Housing Services",
        resource_type: "internal",
        description: "Helps clients find housing options",
    },
    {
        service_id: "2",
        name: "Food Assistance",
        program_name: null,
        resource_type: "external",
        description: "Connects clients with food resources",
    },
    {
        service_id: "3",
        name: "Counseling Services",
        program_name: "Mental Health",
        resource_type: "internal",
        description: "Provides counseling and support",
    },
];

const pageSize = 2;

export default function ServicesPage() {
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filteredResources = sampleResources.filter((resource) => {
        const searchText = search.toLowerCase();

        return (
            resource.name.toLowerCase().includes(searchText) ||
            (resource.program_name ?? "").toLowerCase().includes(searchText) ||
            (resource.description ?? "").toLowerCase().includes(searchText)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredResources.length / pageSize));
    const startIndex = (page - 1) * pageSize;
    const visibleResources = filteredResources.slice(
        startIndex,
        startIndex + pageSize
    );

    function handleViewDetails(serviceId: string) {
        const resource = sampleResources.find(
            (item) => item.service_id === serviceId
        );

        setSelectedResource(resource ?? null);
    }

    function handleSearch(value: string) {
        setSearch(value);
        setPage(1);
    }

    return (
        <main style={{ padding: "30px" }}>
            <h1>Service Catalog</h1>
            <p>Browse available internal and external services.</p>

            <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                style={{ padding: "8px", marginBottom: "20px", width: "300px" }}
            />

            <ResourceTable
                resources={visibleResources}
                onViewDetails={handleViewDetails}
            />

            <div style={{ marginTop: "20px" }}>
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>

                <span style={{ margin: "0 15px" }}>
                    Page {page} of {totalPages}
                </span>

                <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>

            {selectedResource && (
                <section style={{ marginTop: "30px" }}>
                    <h2>{selectedResource.name}</h2>
                    <p>Program: {selectedResource.program_name ?? "Not available"}</p>
                    <p>Type: {selectedResource.resource_type}</p>
                    <p>Description: {selectedResource.description ?? "Not available"}</p>

                    <button
                        type="button"
                        onClick={() => setSelectedResource(null)}
                    >
                        Close Details
                    </button>
                </section>
            )}
        </main>
    );
}
