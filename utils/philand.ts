import axios from "axios";
import { PHILAND_HOLDERS_API_ENDPOINT } from "~/constants";
import { defaultPhiland, defaultPhilandLinks, PhilandHolder } from "~/types";
import { toNumber, toString } from "./cairo";

export const isEmptyPhiland = (dataPhiland?: any[]): boolean => {
  if (!dataPhiland) return true;

  return !dataPhiland.some((data) => toNumber(data) > 0);
};

export const isEmptyLinks = (dataLinks?: any[]): boolean => {
  if (!dataLinks) return true;

  return !dataLinks.some((data) => {
    const targetOwner = toString(data.target_owner.low);
    return targetOwner !== "0";
  });
};

export const convertPhiland = (dataPhiland: any[]): number[][] => {
  const copied = JSON.parse(JSON.stringify(defaultPhiland));
  dataPhiland.forEach((data, i) => {
    copied[Math.floor(i / 8)][Math.floor(i % 8)] = toNumber(data);
  });
  return copied;
};

export const convertPhilandLinks = (dataLinks: any[]): string[][] => {
  const copied = JSON.parse(JSON.stringify(defaultPhilandLinks));
  dataLinks.forEach((data, i) => {
    const targetOwner = toString(data.target_owner.low);
    copied[Math.floor(i / 8)][Math.floor(i % 8)] = targetOwner === "0" ? "" : targetOwner;
  });
  return copied;
};

export const fetchPhilandHolders = async (): Promise<PhilandHolder[]> => {
  const res = await axios.get<{ result: PhilandHolder[] }>(PHILAND_HOLDERS_API_ENDPOINT);
  return res.data.result;
};
