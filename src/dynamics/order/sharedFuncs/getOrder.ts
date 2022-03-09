import { IOrder, ROrder, orders } from "../../../schemas/mod.ts";
import { Bson } from "../../../utils/deps.ts";
import { makeProjections } from "../../../utils/mod.ts";
import { throwError } from "../../../utils/mod.ts";

type GetOrderInput = {
  _id: Bson.ObjectId;
  get: ROrder;
};
type GetOrder = ({ _id, get }: GetOrderInput) => Promise<Partial<IOrder>>;
export const getOrder: GetOrder = async ({ _id, get }) => {
  // TODO: outrelation is empty for now :!
  const projection = makeProjections(get, [], []);
  const foundOrder = await orders.findOne(
    { _id: new Bson.ObjectID(_id) },
    { projection },
  );

  const doRelation = async (order: IOrder, get: ROrder) => {
    // if (!get) {
    //   return { _id: order._id };
    // } else {
    return order;
    // }
  };
  return foundOrder!
    ? await doRelation(foundOrder!, get)
    : throwError("can not find order");
};
