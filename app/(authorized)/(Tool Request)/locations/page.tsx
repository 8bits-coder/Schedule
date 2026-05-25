"use server";

import LocationForm from "./form";
import ShowAllLocations from "./locations";

export default async function LocationPage() {
  return (
    <div className="container mx-auto py-8 not-sm:px-2 space-y-8">
      <LocationForm />
      <ShowAllLocations />
    </div>
  );
}
