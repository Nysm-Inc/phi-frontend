import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { SimpleGrid, Center, useTheme, Box, Text, Spacer } from "@chakra-ui/react";
import { Abi } from "starknet";
import { useContract, useStarknetCall } from "@starknet-react/core";
import { ObjectID, defaultPhiland, defaultPhilandLinks } from "~/types";
import { Cell } from "~/components/philand";
import { L2_OBJECT_CONTRACT_ADDRESS, L2_PHILAND_CONTRACT_ADDRESS } from "~/constants";
import { L2PhilandAbi } from "~/abi";
import { stringToBN, toBN } from "~/utils/cairo";
import { formatENS } from "~/utils/ens";
import { convertPhiland, convertPhilandLinks, isEmptyLinks, isEmptyPhiland } from "~/utils/philand";

const Index: NextPage = () => {
  const router = useRouter();
  const { ens = "" } = router.query;
  const theme = useTheme();
  const { contract } = useContract({ abi: L2PhilandAbi as Abi, address: L2_PHILAND_CONTRACT_ADDRESS });

  const [philand, setPhiland] = useState<ObjectID[][]>(defaultPhiland);
  const [philandLinks, setPhilandLink] = useState<string[][]>(defaultPhilandLinks);

  const { data: dataPhiland } = useStarknetCall({
    contract,
    method: "view_philand",
    args: ens ? [[stringToBN(ens as string), toBN(0)]] : [],
  });
  const { data: dataLinks } = useStarknetCall({
    contract,
    method: "view_links",
    args: ens ? [[stringToBN(ens as string), toBN(0)]] : [],
  });

  useEffect(() => {
    if (isEmptyPhiland(dataPhiland)) return;

    setPhiland(convertPhiland(dataPhiland));
  }, [dataPhiland]);

  useEffect(() => {
    if (isEmptyLinks(dataLinks)) return;

    setPhilandLink(convertPhilandLinks(dataLinks));
  }, [dataLinks]);

  return (
    <Center p="8" h="100%">
      <Box position="absolute" left="24" top="0" pt="7" pl="2">
        <Text fontWeight="bold" fontSize="lg">
          Home
        </Text>
        <Spacer mt="12" />
        <Text fontWeight="bold" fontSize="lg" color="blue.400">
          {formatENS(ens as string)}
        </Text>
      </Box>

      <SimpleGrid columns={1} boxShadow={`0 0 8px ${theme.colors.gray[300]}`}>
        {philand.map((row, i) => (
          <SimpleGrid key={`${i}_${row[i]}`} columns={8}>
            {row.map((cell, j) => (
              <Cell
                key={`${i}_${row[i]}_${j}_${philand[i][j]}_${philandLinks[i][j]}`}
                x={i}
                y={j}
                externalLink={philandLinks[i][j]}
                objectID={cell}
                contractAddress={L2_OBJECT_CONTRACT_ADDRESS}
                isEdit={false}
              />
            ))}
          </SimpleGrid>
        ))}
      </SimpleGrid>
    </Center>
  );
};

export default Index;
