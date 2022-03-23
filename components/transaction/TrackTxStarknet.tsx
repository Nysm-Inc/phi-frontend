import { useEffect, useState } from "react";
import { useToast, AlertStatus, UseToastOptions, Spinner, Flex, Link } from "@chakra-ui/react";
import { Status, TransactionStatus } from "starknet";
import { Transaction, useStarknetTransactionManager } from "@starknet-react/core";
import { STARKNET_BLOCK_EXPLORER_GOERLI } from "~/constants";

const statusMap: { [status in Status & TransactionStatus]: AlertStatus } = {
  TRANSACTION_RECEIVED: "info",
  NOT_RECEIVED: "warning",
  RECEIVED: "info",
  PENDING: "info",
  ACCEPTED_ON_L2: "success",
  ACCEPTED_ON_L1: "success",
  REJECTED: "error",
};

const options = (tx: Transaction): UseToastOptions => {
  return {
    id: tx.transactionHash,
    title: tx.status,
    description: (
      <Flex alignItems="center" justifyContent="space-between">
        <Link href={`${STARKNET_BLOCK_EXPLORER_GOERLI}/tx/${tx.transactionHash}`} isExternal textDecoration="underline">
          view on explorer
        </Link>
        <Spinner color="white" speed="0.7s" size="sm" />
      </Flex>
    ),
    // @ts-ignore
    status: statusMap[tx.status],
    position: "bottom-right",
    duration: null,
    isClosable: true,
    containerStyle: {
      fontFamily: "monospace",
      fontWeight: "bold",
    },
  };
};

const TrackTxStarknet = () => {
  const [trackingQueue, setTrackingQueue] = useState<string[]>([]);
  const { transactions = [] } = useStarknetTransactionManager();
  const toast = useToast();

  useEffect(() => {
    if (transactions.length <= 0) return;

    transactions.forEach((tx) => {
      if (!toast.isActive(tx.transactionHash)) {
        if (!trackingQueue.includes(tx.transactionHash)) {
          setTrackingQueue((old) => [...old, tx.transactionHash]);
          toast(options(tx));
        }
      } else {
        toast.update(tx.transactionHash, options(tx));

        if (tx.status === "ACCEPTED_ON_L2") {
          setTimeout(() => {
            toast.close(tx.transactionHash);
          }, 3000);
        }
      }
    });
  }, [transactions]);

  return <></>;
};

export default TrackTxStarknet;
