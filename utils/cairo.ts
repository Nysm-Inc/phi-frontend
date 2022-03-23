import { number, shortString } from "starknet";

export const toBN = (num: number.BigNumberish): string => number.toBN(num).toString(10);

export const stringToBN = (str: string): string => {
  return shortString.isShortString(str) ? number.toBN(shortString.encodeShortString(str)).toString(10) : "";
};

export const toNumber = (num: number.BigNumberish): number => Number(toBN(num));

export const toString = (hex: number.BigNumberish): string => {
  return shortString.decodeShortString(number.toHex(number.toBN(hex)));
};
