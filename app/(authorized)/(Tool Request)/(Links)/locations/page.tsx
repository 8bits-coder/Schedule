"use server";

import BodyWrapper from "@/components/custom_ui/BodyWrapper";
import LocationForm from "./form";
import ShowAllLocations from "./locations";

export default async function LocationPage() {
  return (
    <BodyWrapper>
      <LocationForm />
      <ShowAllLocations />
    </BodyWrapper>
  );
}
