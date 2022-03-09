import FastestValidator from "https://esm.sh/fastest-validator@1";
import { orderSelectable, ROrder } from "../../schemas/mod.ts";
const v = new FastestValidator();
export const schema = {
  details: {
    type: "object",
    props: {
      set: {
        type: "object",
        props: {
          orderId: { type: "string" },
          wareId: { type: "string" },
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

export const checkDeleteWareOfOrder = v.compile(schema);
export interface deleteWareOfOrderDetails {
  set: {
    orderId: string;
    wareId: string;
  };
  get: ROrder;
}
