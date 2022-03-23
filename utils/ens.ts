export const formatENS = (ens: string) => {
  return ens.length <= 16 ? ens.substring(0, 16) : `${ens.substring(0, 6)}...${ens.substring(ens.length - 7)}`;
};
