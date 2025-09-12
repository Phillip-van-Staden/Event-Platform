// app/api/webhook/clerk/route.ts
export const runtime = "nodejs";

import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  if (!SIGNING_SECRET) {
    console.error("SIGNING_SECRET missing");
    return new Response("Server misconfigured", { status: 500 });
  }

  // Read headers directly from the Request
  const svixId = req.headers.get("svix-id");
  const svixTs = req.headers.get("svix-timestamp");
  const svixSig = req.headers.get("svix-signature");

  if (!svixId || !svixTs || !svixSig) {
    console.error("Missing svix headers:", { svixId, svixTs, svixSig });
    return new Response("Missing svix headers", { status: 400 });
  }

  // Use the raw text body (important for signature verification)
  const rawBody = await req.text();

  const wh = new Webhook(SIGNING_SECRET);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTs,
      "svix-signature": svixSig,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Svix verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log("Verified webhook:", evt.type);

  try {
    const eventType = evt.type;

    if (eventType === "user.created") {
      const {
        id,
        email_addresses,
        image_url,
        first_name,
        last_name,
        username,
      } = evt.data as any;

      const user = {
        clerkId: id,
        email:
          Array.isArray(email_addresses) && email_addresses[0]
            ? email_addresses[0].email_address
            : "",
        username: username ?? "",
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        photo: image_url ?? "",
      };

      const newUser = await createUser(user);
      console.log("DB createUser result:", newUser ? newUser._id : null);

      if (newUser) {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(id, {
          publicMetadata: { userId: newUser._id },
        });
      }

      return NextResponse.json({ message: "OK", user: newUser });
    }

    if (eventType === "user.updated") {
      const { id, image_url, first_name, last_name, username } =
        evt.data as any;

      const user = {
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        username: username ?? "",
        photo: image_url ?? "",
      };

      const updatedUser = await updateUser(id, user);
      console.log(
        "DB updateUser result:",
        updatedUser ? updatedUser._id : null
      );
      return NextResponse.json({ message: "OK", user: updatedUser });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data as any;
      const deletedUser = await deleteUser(id);
      console.log(
        "DB deleteUser result:",
        deletedUser ? deletedUser._id : null
      );
      return NextResponse.json({ message: "OK", user: deletedUser });
    }

    // Unhandled event — return OK so svix/clerk won't retry
    return new Response("", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
