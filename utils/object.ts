import axios from "axios";
import {
  COUPON_API_ENDPOINT,
  L2_MATERIAL_CONTRACT_ADDRESS,
  MetaCraftedMaterialContractAddress,
  MetaPrimitiveMaterialContractAddress,
} from "~/constants";
import { Coupon, CouponConditionMap, ObjectID } from "~/types";
import { L2_OBJECT_CONTRACT_ADDRESS } from "~/constants";
import { toBN, toNumber } from "./cairo";
import { Contract, hash, number } from "starknet";

const endpoint = "https://alpha4.starknet.io/feeder_gateway/call_contract?blockId=null";

export const getCoupon = async (
  account: string,
  objectID: ObjectID
): Promise<{ objectID: ObjectID; coupon: Coupon | undefined }> => {
  const condition = CouponConditionMap[objectID];
  const res = await axios.get(
    `${COUPON_API_ENDPOINT}?address=${account}&object=${condition.objectName}${
      condition.value ? `&value=${condition.value}` : ""
    }`
  );
  return { objectID: objectID, coupon: res.data.coupon };
};

export const fetchMyObjects = async (starknetAccount: string) => {
  const len = 12;
  const owners = [...new Array(len)].map(() => toBN(starknetAccount));
  const tokenIDs = [...new Array(len)].reduce((memo, _, i) => [...memo, toBN(i + 1), toBN(0)], []);
  const res = await axios.post<{ result: string[] }>(endpoint, {
    signature: [],
    calldata: [toBN(len), ...owners, toBN(len), ...tokenIDs],
    contract_address: L2_OBJECT_CONTRACT_ADDRESS,
    entry_point_selector: number.toHex(hash.starknetKeccak("balance_of_batch")),
  });
  const objects = res.data.result.map((res) => toNumber(res));
  objects.shift();
  return {
    contractAddress: L2_OBJECT_CONTRACT_ADDRESS,
    list: objects,
  };
};

export const fetchMyMaterials = async (starknetAccount: string, materialContract: Contract) => {
  const requests = [];
  const len = 2;
  for (let idx = 1; idx <= len; idx++) {
    const request = materialContract.call("balance_of", [toBN(starknetAccount), [toBN(idx), toBN(0)]]);
    requests.push(request);
  }
  const materias = await Promise.all(requests);
  return {
    contractAddress: L2_MATERIAL_CONTRACT_ADDRESS,
    list: materias.map((material) => toNumber(material.res)),
  };
};

export const fetchMetaPrimitiveMaterials = async (starknetAccount: string) => {
  const len = 4;
  const owners = [...new Array(len)].map(() => toBN(starknetAccount));
  const tokenIDs = [...new Array(len)].reduce((memo, _, i) => [...memo, toBN(i), toBN(0)], []);
  const res = await axios.post<{ result: string[] }>(endpoint, {
    signature: [],
    calldata: [toBN(len), ...owners, toBN(len), ...tokenIDs],
    contract_address: MetaPrimitiveMaterialContractAddress,
    entry_point_selector: number.toHex(hash.starknetKeccak("balance_of_batch")),
  });
  const objects = res.data.result.map((res) => toNumber(res));
  objects.shift();
  return {
    contractAddress: MetaPrimitiveMaterialContractAddress,
    list: objects,
  };
};

export const fetchMetaCraftedMaterials = async (starknetAccount: string) => {
  const len = 8;
  const owners = [...new Array(len)].map(() => toBN(starknetAccount));
  const tokenIDs = [...new Array(len)].reduce((memo, _, i) => [...memo, toBN(i), toBN(0)], []);
  const res = await axios.post<{ result: string[] }>(endpoint, {
    signature: [],
    calldata: [toBN(len), ...owners, toBN(len), ...tokenIDs],
    contract_address: MetaCraftedMaterialContractAddress,
    entry_point_selector: number.toHex(hash.starknetKeccak("balance_of_batch")),
  });
  const objects = res.data.result.map((res) => toNumber(res));
  objects.shift();
  return {
    contractAddress: MetaCraftedMaterialContractAddress,
    list: objects,
  };
};
