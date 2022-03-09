import { IOrder, orders } from "../../schemas/mod.ts";
import { Bson } from "../../utils/deps.ts";
import { checkRoleFn } from "../../utils/mod.ts";
import { checkValidation } from "../../utils/mod.ts";
import { isAuthFn } from "../../utils/mod.ts";
import { emptyTokenError, throwError } from "../../utils/mod.ts";
import { Context } from "../utils/context.ts";
import { checkDeleteWareOfOrder, deleteWareOfOrderDetails } from "./deleteWareOfOrder.type.ts";
import { getOrder } from "./sharedFuncs/getOrder.ts";

// TODO we should be just have a update ware order and delete all other method working on change order
type DeleteWareOfOrderFn = (
    details: deleteWareOfOrderDetails,
    context: Context,
) => Promise<IOrder | object>;
/**this function is for updating the status of order and payment */
export const deleteWareOfOrderFn: DeleteWareOfOrderFn = async (
    details,
    context,
) => {
    /**check the token  */
    !context ? emptyTokenError() : null;

    /**check user is authenticated */
    const user = await isAuthFn(context.token!);

    /**if user was authenticated,check the user role */
    user
        ? checkRoleFn(user, ["Admin", "Normal"])
        : throwError("The role should be Admin, Normal");

    /** check whether the details(input) is right or not*/
    checkValidation(checkDeleteWareOfOrder, { details });

    const {
        set: { orderId, wareId },
        get,
    } = details;
    /**find the order */
    const foundOrder = await orders.findOne({ _id: new Bson.ObjectID(orderId) });

    /**check id the order is in processing status,otherWise the ware cant get delete */
    foundOrder!.orderStatus != "PROCESSING"
        ? throwError(
            `the order status is ${foundOrder!.orderStatus}, the ware can't be deleted`,
        )
        : null;

    /**find the ware that is going to be deleted from foundOrder */
    const wareToDelete = foundOrder!.wares.find(
        (x: any) => x.ware._id.toString() == new Bson.ObjectID(wareId),
    );

    /** delete the specified ware from order
     * and update the totalQuantity and totalPrice of the order */
    // const order = await orders.updateOne(
    //   {
    //     _id: new Bson.ObjectID(orderId),
    //   },
    //   {
    //     $pull: {
    //       wares: {
    //         "ware._id": new Bson.ObjectID(wareId),
    //       },
    //     },
    //     $set: {
    //       totalPrice: foundOrder!.totalPrice - wareToDelete!.warePrice,
    //       totalQuantity: foundOrder!.totalQuantity - wareToDelete!.quantity,
    //     },
    //   },
    // );
    //   TODO
    /**delete the order that has to ware but what am I going to return???? */
    // const a = await orders.findOne({ _id: order.upsertedId });
    // a!.wares.length == 0
    //   ? await orders.deleteOne({ _id: order.upsertedId })
    //   : throwError("the order was deleted");

    return getOrder({ _id: new Bson.ObjectID(orderId), get: details.get });
};
