import { getOrder } from "./sharedFuncs/getOrder.ts";
import { orders, IOrder } from "../../schemas/mod.ts";
import { throwError } from "../../utils/mod.ts";
import { Context } from "../utils/context.ts";
import { checkUpdateOrder, updateOrderDetails } from "./updateOrder.type.ts";
import { isAuthFn } from "../../utils/mod.ts";
import { checkRoleFn } from "../../utils/mod.ts";
import { checkValidation } from "../../utils/mod.ts";
import { Bson } from "../../utils/deps.ts";

type UpdateOrderFn = (
  details: updateOrderDetails,
  context: Context,
) => Promise<Partial<IOrder>>;
/**this function is for updating the status of order and payment */
export const updateOrderFn: UpdateOrderFn = async (details, context) => {
  /**check user is authenticated */
  const user = await isAuthFn(context.token!);

  /**if user was authenticated,check the user role */
  user
    ? await checkRoleFn(user, ["Admin", "Normal"])
    : throwError("The role should be Admin, Normal");

  /** check whether the details(input) is right or not*/
  checkValidation(checkUpdateOrder, { details });

  const {
    set: { orderId, paymentStatus, orderStatus },
    get: {},
  } = details;
  /**update the order */
  const order = await orders.updateOne(
    {
      _id: new Bson.ObjectID(orderId),
    },
    {
      $set: {
        paymentStatus,
        orderStatus,
      },
    },
  );

  return getOrder({ _id: new Bson.ObjectID(orderId), get: details.get });
};
