import FastestValidator from "https://esm.sh/fastest-validator@1";
import { countrySelectable, RCountry } from "../../schemas/mod.ts";
import { ObjectID } from "../../utils/deps.ts";
const v = new FastestValidator();
export const schema = {
  details: {
    type: "object",
    props: {
      set: {
        type: "object",
        props: {
          _id: { type: "objectID", ObjectID },
        },
      },
      get: {
        type: "object",
        optional: true,
        props: countrySelectable(1),
      },
    },
  },
};
export const checkGetCountryDetails = v.compile(schema);
export interface getCountryDetails {
  set: {
    _id: ObjectID;
  };
  get: RCountry;
}
