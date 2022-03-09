import { IOrder, orders } from "./../../schemas/order.ts";
import {
  emptyTokenError,
  notFoundError,
  throwError,
} from "./../../utils/mod.ts";
import { Context } from "./../utils/context.ts";
import { checkDeleteOrder } from "./deleteOrder.type.ts";
import { deleteOrderDetails } from "./deleteOrder.type.ts";
import { isAuthFn } from "../../utils/mod.ts";
import { checkRoleFn } from "../../utils/mod.ts";
import { checkValidation } from "../../utils/mod.ts";
import { Bson } from "../../utils/deps.ts";

type DeleteOrderFn = (
  details: deleteOrderDetails,
  context: Context,
) => Promise<IOrder>;
export const deleteOrderFn: DeleteOrderFn = async (details, context) => {
  /**check the token  */
  !context ? emptyTokenError() : null;

  /**check user is authenticated */
  const user = await isAuthFn(context.token!);

  /**if user was authenticated,check the user role */
  user
    ? await checkRoleFn(user, ["Admin", "Normal"])
    : throwError("The role should be Admin, Normal");

  /** check whether the details(input) is right or not*/
  checkValidation(checkDeleteOrder, { details });

  const {
    set: { orderId },
    get: {},
  } = details;
  /**find the props of wares that
   * the user filled them and they are now in the orders  */
  const order = await orders.findOne({ _id: new Bson.ObjectID(orderId) });
  order
    ? await orders.deleteOne({
        _id: new Bson.ObjectID(orderId),
      })
    : throwError("the desired order doen not exist");

  return order!;
};
