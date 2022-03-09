import { IOrder } from "./../../schemas/mod.ts";
import { Context } from "./../utils/context.ts";
import { checkValidation } from "./../../utils/mod.ts";
import { checkOrdersDetails, getOrdersDetails } from "./getOrders.type.ts";
import { getOrders } from "./sharedFuncs/getOrders.ts";
import { isAuthFn } from "../../utils/mod.ts";
import { checkRoleFn } from "../../utils/mod.ts";
import { throwError } from "../../utils/mod.ts";
import { Bson } from "../../utils/deps.ts";

type GetOrdersFn = (
  details: getOrdersDetails,
  context: Context,
) => Promise<Partial<IOrder>[]>;

/**
 * @function
 * get orders with especial filters
 * @param details
 * @param context
 */
export const getOrdersFn: GetOrdersFn = async (details, context) => {
  /**check user is authenticated */
  const user = await isAuthFn(context.token!);

  /**if user was authenticated,check the user role */
  user
    ? await checkRoleFn(user, ["Admin", "Normal"])
    : throwError("The role should be Admin, Normal");

  /** check whether the details(input) is right or not*/
  checkValidation(checkOrdersDetails, { details });
  const {
    set: { userId, paymentStatus, orderStatus, wareIds, sort, pagination },
    get,
  } = details;

  /**the default sort is createdAt descending */
  const defaultSort: getOrdersDetails["set"]["sort"] = sort
    ? sort
    : { createdAt: -1 };

  const objIds =
    wareIds !== undefined ? wareIds!.map(x => new Bson.ObjectID(x)) : null;

  const userObjId = new Bson.ObjectID(userId);
  let filter: Bson.Document = {};
  userId &&
    (filter = {
      ...filter,
      "user._id": { $eq: userObjId },
    });

  wareIds &&
    (filter = {
      ...filter,
      "wares.ware._id": { $in: objIds },
    });
  orderStatus &&
    (filter = {
      ...filter,
      orderStatus: { $regex: orderStatus },
    });
  paymentStatus &&
    (filter = {
      ...filter,
      paymentStatus: { $regex: paymentStatus },
    });

  return getOrders({
    filter,
    getObj: get,
    sort: defaultSort,
    pagination: {
      limit: pagination?.limit,
      page: pagination?.page,
      lastObjectId: pagination?.lastObjectId,
    },
  });
};
