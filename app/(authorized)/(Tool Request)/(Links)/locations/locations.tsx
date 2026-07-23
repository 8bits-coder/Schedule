import { executeTask } from "@/actions/functions";
import { Button } from "@/components/ui/button";
import { Links } from "@/utility/classes/Links";
import Link from "next/link";

const ShowAllLocations = async () => {
  const { success, data: locations, error } = await executeTask("getAllLocations");

  if (!locations || locations.length === 0 || error || !success) {
    return <div>No locations found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Location List</h1>
      <p>
        Total: <span className="text-red-600">{locations.length}</span>{" "}
        {locations.length === 1 ? "location" : "locations"}
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {locations
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((location) => (
            <div
              key={location.id}
              className="flex flex-col justify-between p-4 bg-white rounded-lg shadow border-l-4 border-indigo-500 space-y-4">
              <strong className="text-lg text-gray-900">{location.name}</strong>
              <Link href={Links.Locations + `/edit/${location.id}`}>
                <Button variant="outline" className={"w-full"}>
                  Edit Location
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ShowAllLocations;
