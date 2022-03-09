import FastestValidator from "https://esm.sh/fastest-validator@1";
import { orderSelectable, ROrder } from "../../schemas/mod.ts";

export const orderStatus = [
    "REJECTED",
    "PROCESSING",
    "DELIVERED",
    "CANCELED",
    "InTRANSIT",
    "RETURNED",
];

export const paymentStatus = ["PAID", "NOTPAID"];

const v = new FastestValidator();
export const schema = {
    details: {
        type: "object",
        props: {
            set: {
                type: "object",
                optional: true,
                props: {},
            },
            get: {
                type: "object",
                optional: true,
                props: orderSelectable(1),
            },
        },
    },
};

export const checkCreateOrder = v.compile(schema);
export interface createOrderDetails {
    set: {
        shoppingCartId: string;
        paymentStatus: string;
        orderStatus: string;
        description: string;
    };
    get: ROrder;
}
