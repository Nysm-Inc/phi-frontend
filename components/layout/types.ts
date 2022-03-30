import { L2_MATERIAL_CONTRACT_ADDRESS, L2_OBJECT_CONTRACT_ADDRESS } from "~/constants";
import { Coupon, ObjectID } from "~/types";

export type ModalMenu = "my_lands" | "my_objects" | "claim_objects" | "login_bonus";

export type MyObject = {
  objectID: ObjectID;
  isPuttable: boolean;
  contractAddress: typeof L2_OBJECT_CONTRACT_ADDRESS | typeof L2_MATERIAL_CONTRACT_ADDRESS;
};

export type ClaimObject = {
  objectID: ObjectID;
  isClaimable: boolean;
  coupon: Coupon;
};
