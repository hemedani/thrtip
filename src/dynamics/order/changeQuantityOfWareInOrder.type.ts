import { ROrder } from "./../../schemas/mod.ts";
import FastestValidator from "https://esm.sh/fastest-validator@1";
import { orderSelectable } from "../../schemas/mod.ts";
const v = new FastestValidator();
export const schema = {
  details: {
    type: "object",
    props: {
      set: {
        type: "object",
        props: {
          /**
           *the order _id
           * */
          orderId: { type: "string" },
          /**the ID of the ware */
          wareId: { type: "string" },
          /**
           *the number of the wares that is in the order
           * */
          quantity: { type: "number" },
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

export const changeQuantityOfWareInOrderDetails = v.compile(schema);

/**
 * @interface
 * Represent Input details
 * * this is input of changing th e quantity of ware in order
 * object "get" for specify user what wants to return
 * object "set" for input value
 */
export interface changeQuantityOfWareInOrder {
  set: {
    orderId: string;
    wareId: string;
    quantity: number;
  };
  get: ROrder;
}
