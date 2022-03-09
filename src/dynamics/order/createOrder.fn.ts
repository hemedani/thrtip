import { orders, orders as orderCollection, puOrderProjection, users, wares } from "../../schemas/mod.ts";
import { IOrder, OrderStatus, PaymentStatus } from "./../../schemas/order.ts";
import { shoppingCarts } from "./../../schemas/shoppingCart.ts";
import { Bson } from "../../utils/deps.ts";
import { emptyTokenError, throwError } from "./../../utils/mod.ts";
import { isAuthFn } from "../../utils/mod.ts";
import { checkValidation } from "../../utils/mod.ts";
import { getUserWhitInterface } from "../user/funcs/getUser.ts";
import { Context } from "./../utils/context.ts";
import { checkCreateOrder, createOrderDetails } from "./createOrder.type.ts";
import { getOrder } from "./sharedFuncs/getOrder.ts";

type CreateOrderFn = (
    details: createOrderDetails,
    context: Context,
) => Promise<Partial<IOrder>>;

export const createOrderFn: CreateOrderFn = async (details, context) => {
    /**check the token  */
    !context && emptyTokenError();

    /**check user is authenticated */
    const user = await isAuthFn(context.token!);

    /**if user was authenticated,check the user role */
    // user ? checkRoleFn(user, ["Admin", "Normal"]) : notFoundError("User");

    /** check whether the details(input) is right or not*/
    checkValidation(checkCreateOrder, { details });

    const { get } = details;

    /**
     * check if the user shopping cart exists or not,
     */
    const shoppingCart = await shoppingCarts.findOne({
        "user._id": user._id,
    });

    !shoppingCart && throwError("this type of selected product can not buy");
    shoppingCart?.wares
        && shoppingCart.wares.length < 0
        && throwError("there is not any product in your cart");

    const pureUser = await getUserWhitInterface({ _id: user._id, type: "Pure" });

    /**insert the shoppingCart to order */
    const order = await orderCollection.insertOne({
        createdAt: new Date(Date.now()),
        totalPrice: shoppingCart!.totalPrice,
        totalQuantity: shoppingCart!.totalQuantity,
        user: pureUser,
        wares: shoppingCart!.wares,
        paymentStatus: PaymentStatus.NotPaid,
        orderStatus: OrderStatus.Processing,
        description: shoppingCart?.description,
    });

    /** find the newly created Order, the get the pure out of it
     *  to embed in order collections */
    // const foundOrder = await orderCollection.findOne({ _id: order });

    /**find the id of wares, that are in the created order */
    const orderedWaresId = shoppingCart?.wares.map(ware => ware.ware._id);
    /** put the newly created order as an embedded document in wares
     * wares:the wares that exist in the order
     */

    const pureOrder = await orders.findOne(
        { _id: order },
        { projection: puOrderProjection() },
    );

    const updatedWares = await wares.updateMany(
        { _id: { $in: orderedWaresId } },
        {
            $push: {
                orders: {
                    $each: [pureOrder!],
                    $sort: { _id: -1 },
                    $slice: 50,
                    // TODO:the default value of sort should given, and sortBy should be optional
                },
            },
        },
    );

    await users.updateOne(
        { _id: user._id },
        {
            $push: {
                orders: {
                    $each: [pureOrder],
                    $sort: { _id: -1 },
                    $slice: 50,
                },
            },
        },
    );

    //   await manEmbedded({
    //       array: orderedWaresId!,
    //       schema: wares,
    //       embeddedField: "orders",
    //       document: [pureOrder!]!,
    //       limit: 50,
    //       headOrTail: "head",
    //       sortBy: "_id",
    //       sortOrder: "Ascending",
    //   });

    /** embed the order, for the user
     * the user is the user owns the shoppingCart and then owns the order
     * it is not the user in token!
     * maybe the token is for an admin that is is creating the order for the customer
     */

    // await manEmbedded({
    //     array: [foundOrder!.user._id.toHexString()],
    //     schema: users,
    //     embeddedField: "orders",
    //     document: [pureOrder!]!,
    //     limit: 50,
    //     headOrTail: "head",
    //     sortBy: "_id",
    //     sortOrder: "Ascending",
    // });

    // delete the shoppingCart from ShoppingCarts
    await shoppingCarts.updateOne(
        { _id: shoppingCart?._id },
        {
            $set: {
                wares: [],
                totalPrice: 0,
                totalQuantity: 0,
                description: "",
                updatedAt: new Date(),
            },
        },
    );
    // await shoppingCarts.deleteOne({ _id: new Bson.ObjectID(shoppingCartId) });

    return getOrder({ _id: new Bson.ObjectID(order), get });
};
