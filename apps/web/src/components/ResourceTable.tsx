
export type Resource = {
  service_id: string;
  name: string;
  program_name: string | null;
  resource_type: "internal" | "external";
  description: string | null;
};

type ResourceTableProps = {
  resources: Resource[];
  onViewDetails: (serviceId: string) => void;
};

export default function ResourceTable({
  resources,
  onViewDetails,
}: ResourceTableProps) {
  if (resources.length === 0) {
    return <p>No services found.</p>;
  }

  return (
    <table
    style={{
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
    }}
>
      <thead>
        <tr>
          <th style={{ padding: "12px" }}>Service Name</th>
          <th style={{ padding: "12px" }}>Program</th>
          <th style={{ padding: "12px" }}>Type</th>
          <th style={{ padding: "12px" }}>Description</th>
          <th style={{ padding: "12px" }}>Details</th>
        </tr>
      </thead>

      
        <tbody>
            {resources.map((resource) => (
                <tr key={resource.service_id}>
                    <td style={{ padding: "12px" }}>{resource.name}</td>
                    <td style={{ padding: "12px" }}>
                        {resource.program_name ?? "Not available"}
                    </td>
                    <td style={{ padding: "12px" }}>{resource.resource_type}</td>
                    <td style={{ padding: "12px" }}>
                        {resource.description ?? "Not available"}
                    </td>
                    <td style={{ padding: "12px" }}>
                        <button
                            type="button"
                            onClick={() => onViewDetails(resource.service_id)}
                        >
                            View Details
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
  );
}
