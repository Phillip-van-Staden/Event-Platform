import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const UpdateEvent = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;

  return (
    <>
      <section className="bg-gray-50 bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Create Event
        </h3>
      </section>
      <div className="wrapper my-8">
        <EventForm userId={userId} type="Update" />
      </div>
    </>
  );
};

export default UpdateEvent;
