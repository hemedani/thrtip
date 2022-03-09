import FastestValidator from "https://esm.sh/fastest-validator@1";
import { orderSelectable, PuOrder, ROrder } from "../../schemas/mod.ts";
import {
  basePaginationValidationObject,
  PaginationType,
  SortType,
} from "../../utils/mod.ts";

const v = new FastestValidator();
export const schema = {
  details: {
    type: "object",
    props: {
      set: {
        type: "object",
        props: {
          ...basePaginationValidationObject<PuOrder>(
            "createdAt",
            "updateAt",
            "totalPrice",
            "paymentStatus",
            "orderStatus",
          ),

          /**an array of ware ids */
          wareIds: { type: "array", items: "string", optional: true },
          paymentStatus: { type: "string", optional: true },
          orderStatus: { type: "string", optional: true },
          userId: { type: "string", optional: true },
        },
      },
      get: {
        type: "object",
        optional: true,
        props: orderSelectable({ wares: 1, user: 2 }),
      },
    },
  },
};

export const checkOrdersDetails = v.compile(schema);
export interface getOrdersDetails {
  set: {
    userId?: string;
    paymentStatus?: string;
    orderStatus?: string;
    wareIds?: string[];
    sort?: SortType<PuOrder>;
    pagination: PaginationType;
  };
  get: ROrder;
}
