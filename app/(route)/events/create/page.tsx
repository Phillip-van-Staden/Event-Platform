import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const CreateEvent = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;

  return (
    <>
      <section className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left text-white">
          Create Event
        </h3>
      </section>
      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
