import { Flex, Spinner, Link, UseToastOptions } from "@chakra-ui/react";
import { ETHEREUM_BLOCK_EXPLORER_GOERLI } from "~/constants";

export const toastOption = (txHash: string): UseToastOptions => {
  return {
    id: txHash,
    title: "TRANSACTION SUBMITTED",
    description: (
      <Flex alignItems="center" justifyContent="space-between">
        <Link href={`${ETHEREUM_BLOCK_EXPLORER_GOERLI}/tx/${txHash}`} isExternal textDecoration="underline">
          view on explorer
        </Link>
        <Spinner color="white" speed="0.7s" size="sm" />
      </Flex>
    ),
    status: "info",
    position: "bottom-right",
    duration: 1000 * 30,
    isClosable: true,
    containerStyle: {
      fontFamily: "monospace",
      fontWeight: "bold",
    },
  };
};
