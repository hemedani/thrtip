import { checkRoleFn, isAuthFn } from "./../../utils/mod.ts";
import { IOrder } from "./../../schemas/mod.ts";
import { checkValidation } from "./../../utils/mod.ts";
import { Context } from "./../utils/context.ts";

import { checkGetOrderDetails, getOrderDetails } from "./getOrder.type.ts";
import { getOrder } from "./sharedFuncs/getOrder.ts";
import { throwError } from "../../utils/mod.ts";
import { Bson } from "../../utils/deps.ts";

type GetOrderFn = (
  details: getOrderDetails,
  context: Context,
) => Promise<Partial<IOrder>>;

/**
 * @function
 * Represent create BlogPost(insert a new blogPost to DB)
 * @param details
 * @param context
 */
export const getOrderFn: GetOrderFn = async (details, context) => {
  /**check user is authenticated */
  const user = await isAuthFn(context.token!);

  /**if user was authenticated,check the user role */
  user
    ? await checkRoleFn(user, ["Admin", "Normal"])
    : throwError("The role should be Admin, Normal");

  /** check whether the details(input) is right or not*/
  checkValidation(checkGetOrderDetails, { details });
  const {
    set: { _id },
    get,
  } = details;

  const obId = new Bson.ObjectId(_id);

  return getOrder({ _id: obId, get });
};
