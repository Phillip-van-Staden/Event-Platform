import Search from "@/components/shared/Search";
import { getEventById } from "@/lib/actions/event.actions";
import { getOrdersByEvent } from "@/lib/actions/order.actions";
import { IOrderItem } from "@/lib/database/models/order.model";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { SearchParamProps } from "@/types";

const Orders = async ({ searchParams }: SearchParamProps) => {
  const params = await searchParams;
  const eventId = (params?.eventId as string) || "";
  const searchText = (params?.query as string) || "";

  // Fetch both the event and the orders
  const event = await getEventById(eventId);
  const orders = await getOrdersByEvent({ eventId, searchString: searchText });

  // Calculate insightful metrics
  const totalRevenue = orders.reduce((total: number, order: IOrderItem) => {
    return total + Number(order.totalAmount);
  }, 0);

  const totalTicketsSold = orders.reduce((total: number, order: IOrderItem) => {
    return total + (order.quantity || 1);
  }, 0);

  return (
    <>
      {/* SECTION 1: HEADER */}
      <section className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 bg-cover bg-center py-5 md:py-10">
        <div className="wrapper flex flex-col gap-2 text-center sm:text-left">
          <p className="font-semibold text-[#705cf7]">EVENT SALES DASHBOARD</p>
          <h3 className="h3-bold text-white">
            Orders for: <span className="text-gray-300">{event?.title}</span>
          </h3>
        </div>
      </section>

      {/* SECTION 2: ANALYTICS DASHBOARD */}
      <section className="wrapper mt-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Total Revenue Card */}
          <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-6 shadow-md">
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(totalRevenue)}
              </p>
            </div>
          </div>
          {/* Tickets Sold Card */}
          <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-6 shadow-md">
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Tickets Sold
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalTicketsSold}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SEARCH & TABLE */}
      <section className="wrapper mt-8">
        <Search placeholder="Search by buyer name..." />
      </section>

      <section className="wrapper overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 text-left text-sm font-semibold uppercase text-gray-600">
              <th className="p-4">Order ID</th>
              <th className="p-4">Event Title</th>
              <th className="p-4">Buyer</th>
              <th className="p-4">Created Date</th>
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              <>
                {orders &&
                  orders.map((row: IOrderItem) => (
                    <tr
                      key={row._id}
                      className="border-b text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <td className="min-w-[250px] p-4 font-mono text-purple-600">
                        {row._id}
                      </td>
                      <td className="min-w-[200px] p-4 font-medium">
                        {row.eventTitle}
                      </td>
                      <td className="min-w-[150px] p-4">{row.buyer}</td>
                      <td className="min-w-[100px] p-4">
                        {formatDateTime(row.createdAt).dateOnly}
                      </td>
                      <td className="min-w-[100px] p-4 text-center font-bold">
                        {row.quantity || 1}
                      </td>
                      <td className="min-w-[100px] p-4 text-right font-semibold text-green-600">
                        {formatPrice(row.totalAmount)}
                      </td>
                    </tr>
                  ))}
              </>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default Orders;
