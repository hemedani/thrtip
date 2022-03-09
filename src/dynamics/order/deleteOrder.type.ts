import FastestValidator from "https://esm.sh/fastest-validator@1";
import { ROrder, orderSelectable } from "../../schemas/mod.ts";

const v = new FastestValidator();
export const schema = {
  details: {
    type: "object",
    props: {
      set: {
        type: "object",
        props: {
          /**the id of the order that is going to be deleted */
          orderId: { type: "string" },
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

export const checkDeleteOrder = v.compile(schema);
export interface deleteOrderDetails {
  set: {
    orderId: string;
  };
  get: ROrder;
}
