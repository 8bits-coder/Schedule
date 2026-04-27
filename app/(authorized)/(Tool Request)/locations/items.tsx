import { GetAllLocations } from "@/actions/locationActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ShowAllLocations = async () => {
  const locations = await GetAllLocations();
  if (!locations) {
    return <div>No locations found.</div>;
  }

  return (
    <div className="space-y-6">
      <p>
        Total: <span className="text-red-600">{locations.length}</span>{" "}
        {locations.length === 1 ? "location" : "locations"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500 space-x-2"
          >
            <strong className="text-lg text-gray-900">{location.name}</strong>
            <Button variant="outline" size="sm" className="mt-2">
              <Link href={`/locations/edit/${location.id}`}>Edit Location</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowAllLocations;
