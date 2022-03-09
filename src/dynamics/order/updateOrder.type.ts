import FastestValidator from "https://esm.sh/fastest-validator@1";
import { ROrder, orderSelectable } from "../../schemas/mod.ts";
import { orderStatus, paymentStatus } from "./createOrder.type.ts";

const v = new FastestValidator();
export const schema = {
  details: {
    type: "object",
    props: {
      set: {
        type: "object",
        props: {
          /**the id of the order that is going to be change */
          orderId: { type: "string" },

          // changeable fields of order:
          /** the status of the payment*/
          description: { type: "string", optional: true },

          paymentStatus: {
            type: "enum",
            values: paymentStatus,
            optional: true,
          },
          /**the status of the order */
          OrderStatus: { type: "enum", values: orderStatus, optional: true },

          /**the total price of the order */
          totalPrice: { type: "number", optional: true },

          /**the total quantity of the order */
          totalQuantity: { type: "number", optional: true },
        },
      },
      get: {
        type: "object",
        optional: true,
        props: orderSelectable(1),
      },
    },
  },
};

export const checkUpdateOrder = v.compile(schema);
export interface updateOrderDetails {
  set: {
    orderId: string;
    paymentStatus: string;
    orderStatus: string;
    // totalPrice: number;
    // totalQuantity: number;
  };
  get: ROrder;
}
