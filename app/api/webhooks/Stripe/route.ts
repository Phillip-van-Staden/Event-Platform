// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { createOrder } from "@/lib/actions/order.actions";

// export async function POST(request: Request) {
//   const body = await request.text();

//   const sig = request.headers.get("stripe-signature") as string;
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

//   let event;

//   try {
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//     event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//   } catch (err) {
//     return NextResponse.json({ message: "Webhook error", error: err });
//   }

//   // Get the ID and type
//   const eventType = event.type;

//   // CREATE
//   if (eventType === "checkout.session.completed") {
//     const { id, amount_total, metadata } = event.data.object;

//     const order = {
//       stripeId: id,
//       eventId: metadata?.eventId || "",
//       buyerId: metadata?.buyerId || "",
//       totalAmount: amount_total ? (amount_total / 100).toString() : "0",
//       createdAt: new Date(),
//       quantity: metadata?.quantity ? Number(metadata.quantity) : 1,
//     };

//     const newOrder = await createOrder(order);
//     return NextResponse.json({ message: "OK", order: newOrder });
//   }

//   return new Response("", { status: 200 });
// }
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/order.actions";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json(
      { message: "Webhook error", error: String(err) },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    // event.data.object may not include line_items by default. Retrieve session to be safe.
    const sessionObj = event.data.object as Stripe.Checkout.Session;
    try {
      const session = await stripe.checkout.sessions.retrieve(
        sessionObj.id as string,
        {
          expand: ["line_items"],
        }
      );

      // prefer line_items quantities, fallback to metadata.quantity if provided
      let quantity = 1;
      const li = (session as any).line_items;
      if (li && li.data && li.data.length > 0) {
        quantity = li.data.reduce(
          (acc: number, item: any) => acc + (Number(item.quantity) || 0),
          0
        );
      } else if (sessionObj.metadata?.quantity) {
        quantity = Number(sessionObj.metadata.quantity) || 1;
      }

      const amount_total = (sessionObj.amount_total ?? session.amount_total) as
        | number
        | undefined;

      const order = {
        stripeId: sessionObj.id as string,
        eventId: sessionObj.metadata?.eventId || "",
        buyerId: sessionObj.metadata?.buyerId || "",
        totalAmount: amount_total ? (amount_total / 100).toString() : "0",
        createdAt: new Date(),
        quantity,
      };

      const newOrder = await createOrder(order);
      return NextResponse.json(
        { message: "OK", order: newOrder },
        { status: 200 }
      );
    } catch (err) {
      console.error("Error handling checkout.session.completed:", err);
      return NextResponse.json(
        { message: "Server error", error: String(err) },
        { status: 500 }
      );
    }
  }

  // Return 200 for other events
  return new NextResponse("", { status: 200 });
}
