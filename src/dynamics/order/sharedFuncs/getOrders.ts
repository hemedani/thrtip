import { Bson } from "../../../utils/deps.ts";
import { ROrder, IOrder, orders, PuOrder } from "./../../../schemas/mod.ts";

import {
  makePagination,
  makeProjections,
  PaginationInput,
} from "./../../../utils/mod.ts";

type GetOrdersInput = {
  filter: Bson.Document;
  getObj: ROrder;
} & PaginationInput<PuOrder>;

type GetOrders = ({
  filter,
  getObj,
  sort,
  pagination,
}: GetOrdersInput) => Promise<Partial<IOrder>[]>;

export const getOrders: GetOrders = async ({
  filter,
  getObj,
  sort,
  pagination,
}) => {
  const projection = makeProjections(getObj, [], []);

  const returnDocuments = await makePagination<PuOrder>({
    collection: orders,
    query: filter,
    projection,
    sort,
    limit: pagination?.limit,
    lastObjectId: pagination?.lastObjectId,
    page: pagination?.page,
  });

  return returnDocuments;
};
