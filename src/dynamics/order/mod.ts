import FastestValidator, { ValidationError } from "https://esm.sh/fastest-validator@1";
import { IOrder } from "./../../schemas/order.ts";
import { throwError } from "../../utils/mod.ts";
// import { changeQuantityOfWareInOrderFn } from "./changeQuantityOfWareInOrder.fn.ts";
import { createOrderFn } from "./createOrder.fn.ts";
import { deleteOrderFn } from "./deleteOrder.fn.ts";
// import { deleteWareOfOrderFn } from "./deleteWareOfOrder.fn.ts";
import { getOrderFn } from "./getOrder.fn.ts";
import { getOrdersFn } from "./getOrders.fn.ts";
import { updateOrderFn } from "./updateOrder.fn.ts";

const v = new FastestValidator();
const check = v.compile({
    doit: {
        type: "enum",
        values: [
            "createOrder",
            "updateOrder",
            // "deleteWareOfOrder",
            // "changeQuantityOfWareInOrder",
            "deleteOrder",
            "getOrder",
            "getOrders",
        ],
    },
});

export type OrderDoit =
    | "createOrder"
    | "updateOrder"
    // | "deleteWareOfOrder"
    | "deleteOrder"
    | "getOrder"
    | "getOrders";
// | "changeQuantityOfWareInOrder";

type OrderFns = (
    doit: OrderDoit,
    details: any,
    context: any,
) => Promise<Partial<IOrder> | Partial<IOrder>[]>;

export const orderFns: OrderFns = (doit, details, context) => {
    const checkDoit = check({ doit });
    return checkDoit === true
        ? {
            ["createOrder"]: async () => await createOrderFn(details, context),
            ["updateOrder"]: async () => await updateOrderFn(details, context),
            // ["deleteWareOfOrder"]: async () =>
            //   await deleteWareOfOrderFn(details, context),
            ["deleteOrder"]: async () => await deleteOrderFn(details, context),
            ["getOrder"]: async () => await getOrderFn(details, context),
            ["getOrders"]: async () => await getOrdersFn(details, context),
            // ["changeQuantityOfWareInOrder"]: async () =>
            //   await changeQuantityOfWareInOrderFn(details, context),
        }[doit]()
        : throwError((checkDoit as ValidationError[])[0].message!);
};
