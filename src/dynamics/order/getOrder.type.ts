import { orderSelectable, ROrder } from "./../../schemas/mod.ts";
import FastestValidator from "https://esm.sh/fastest-validator@1";

/**validate the input */
const v = new FastestValidator();
export const schema = {
  details: {
    type: "object",
    props: {
      set: {
        type: "object",
        strict: true,
        props: {
          _id: { type: "string" },
        },
      },
      get: {
        type: "object",
        optional: true,
        props: orderSelectable(2),
      },
    },
  },
};

export const checkGetOrderDetails = v.compile(schema);
export interface getOrderDetails {
  set: {
    _id: string;
  };
  get: ROrder;
}
