"use server";

import LocationForm from "./form";
import ShowAllLocations from "./locations";

export default async function LocationPage() {
  return (
    <div className="p-8">
      <LocationForm />
      <h1 className="text-3xl font-bold mb-6">Location List</h1>
      <ShowAllLocations />
    </div>
  );
}
