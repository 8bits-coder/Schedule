"use server";

import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import LocationForm from "./form";
import ShowAllLocations from "./locations";

export default async function LocationPage() {
  return (
    <ContentWrapper>
      <LocationForm />
      <ShowAllLocations />
    </ContentWrapper>
  );
}
