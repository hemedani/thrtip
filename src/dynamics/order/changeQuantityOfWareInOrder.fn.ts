import { checkRoleFn } from "./../../utils/mod.ts";
import { isAuthFn } from "./../../utils/mod.ts";
import { emptyTokenError, throwError } from "./../../utils/mod.ts";
import { orders, IOrder } from "../../schemas/mod.ts";
import { Context } from "./../utils/context.ts";
import {
  changeQuantityOfWareInOrder,
  changeQuantityOfWareInOrderDetails,
} from "./changeQuantityOfWareInOrder.type.ts";
import { checkValidation } from "../../utils/mod.ts";
import { Bson } from "../../utils/deps.ts";
import { getOrder } from "./sharedFuncs/getOrder.ts";

type ChangeQuantityOfWareInOrder = (
  details: changeQuantityOfWareInOrder,
  context: Context,
) => Promise<Partial<IOrder>>;

export const changeQuantityOfWareInOrderFn: ChangeQuantityOfWareInOrder =
  async (details, context) => {
    /** check the user has token*/
    !context ? emptyTokenError() : null;

    /**check user is authenticated */
    const user = await isAuthFn(context.token!);

    /**if user was authenticated,check the user role */
    user
      ? await checkRoleFn(user, ["Admin"])
      : throwError("the role of the user should be Normal or Admin!");

    /**check validation of input */
    checkValidation(changeQuantityOfWareInOrderDetails, { details });

    const {
      set: { orderId, wareId, quantity },
      get: {},
    } = details;

    const foundOrder = await orders.findOne({
      _id: new Bson.ObjectID(orderId),
    });
    /**check id the order is in processing status,otherWise the ware cant get delete */
    foundOrder!.orderStatus != "PROCESSING"
      ? throwError(
          `the order status is ${
            foundOrder!.orderStatus
          }, the ware can't be deleted`,
        )
      : null;

    if (!foundOrder!.wares.length) {
      throwError("there is no ware in the basket");
    }
    /**find The ware from the array of wares,that it's quantity is going to be changed */
    const wareToUpdate = foundOrder!.wares.find(
      (x: any) => x.ware._id.toString() == wareId,
    );

    /**the oldQuantity of ware in the order */
    const oldQuantity = wareToUpdate!.quantity;

    /**the old and the new quantity difference */
    const quantityDifference = quantity - oldQuantity;

    /** The price of ware multiple to Quantity Difference*/
    const PriceDifference = quantityDifference * wareToUpdate!.ware.price;

    const rder = await orders.findOne({
      _id: new Bson.ObjectID(orderId),
      "wares.ware._id": new Bson.ObjectID(wareId),
    });
    // update the quantity of ware and update the totalPrice and the Price of ware with new quantity
    const updatedOrder = await orders.updateOne(
      {
        _id: new Bson.ObjectID(orderId),
        "wares.ware._id": new Bson.ObjectID(wareId),
      },
      {
        $set: {
          "wares.$.quantity": quantity,
          "wares.$.warePrice": quantityDifference * wareToUpdate!.warePrice,
          totalQuantity: foundOrder!.totalQuantity + quantityDifference,
          totalPrice: foundOrder!.totalPrice + PriceDifference,
        },
      },
    );
    return details.get
      ? getOrder({
          _id: updatedOrder!.upsertedId!,
          get: details.get,
        })
      : { _id: updatedOrder!.upsertedId! };
  };
