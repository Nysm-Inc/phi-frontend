import type { NextPage } from "next";
import Image from "next/image";
import { useState, useCallback, useEffect, useMemo, useContext, useRef } from "react";
import {
  Button,
  IconButton,
  VStack,
  SimpleGrid,
  Spinner,
  Text,
  Center,
  Tooltip,
  Link,
  useTheme,
  useToast,
  Box,
  Spacer,
  useClipboard,
} from "@chakra-ui/react";
import axios from "axios";
import { RiSave3Line } from "react-icons/ri";
import { CopyIcon } from "@chakra-ui/icons";
import Web3 from "web3";
import { Abi } from "starknet";
import { useStarknet, useContract, useStarknetCall, useStarknetInvoke, InjectedConnector } from "@starknet-react/core";
import { PhiLogo, TwitterWhite } from "~/public";
import { ObjectID, defaultPhiland, defaultPhilandLinks, PhilandHolder } from "~/types";
import { Cell, Search } from "~/components/philand";
import {
  frontendURL,
  L1_MESSAGE_CONTRACT_ADDRESS,
  L2_PHILAND_CONTRACT_ADDRESS,
  PHILAND_HOLDERS_API_ENDPOINT,
} from "~/constants";
import { L1MessageAbi, L2PhilandAbi } from "~/abi";
import { AppContext } from "~/contexts";
import { toastOption } from "~/components/transaction";
import { stringToBN, toBN } from "~/utils/cairo";
import { formatENS } from "~/utils/ens";
import { convertPhiland, convertPhilandLinks, isEmptyLinks, isEmptyPhiland } from "~/utils/philand";

const Index: NextPage = () => {
  const { account, starknetAccount, currentENS, isEdit, isCreatedPhiland, handleCreatePhiland } =
    useContext(AppContext);
  const { connect } = useStarknet();
  const { contract } = useContract({ abi: L2PhilandAbi as Abi, address: L2_PHILAND_CONTRACT_ADDRESS });
  const theme = useTheme();
  const toast = useToast();

  const isCreatedPhilandRef = useRef(isCreatedPhiland);
  isCreatedPhilandRef.current = isCreatedPhiland;
  const { hasCopied, onCopy } = useClipboard(currentENS);
  const [refleshPhilandHolders, setRefleshPhilandHolders] = useState(false);
  const [philandHolders, setPhilandHolders] = useState<PhilandHolder[]>([]);
  const [philand, setPhiland] = useState<ObjectID[][]>(defaultPhiland);
  const [prevPhiland, setPrevPhiland] = useState<ObjectID[][]>(defaultPhiland);
  const [philandLinks, setPhilandLink] = useState<string[][]>(defaultPhilandLinks);
  const [isCheckedPhilandHolder, setIsCheckedPhilandHolder] = useState(false);
  const { data: dataPhiland } = useStarknetCall({
    contract,
    method: "view_philand",
    args: [[stringToBN(currentENS), toBN(0)]],
  });
  const { data: dataLinks } = useStarknetCall({
    contract,
    method: "view_links",
    args: [[stringToBN(currentENS), toBN(0)]],
  });
  const diff = useMemo(() => {
    const diffX: number[] = [];
    const diffY: number[] = [];
    const diffObjectID: number[] = [];
    philand.forEach((row, i) => {
      row.map((cell, j) => {
        if (cell !== prevPhiland[i][j]) {
          diffX.push(i);
          diffY.push(j);
          diffObjectID.push(cell);
        }
      });
    });
    return { x: diffX, y: diffY, object: diffObjectID };
  }, [philand]);

  const { invoke: invokeBatchWriteObject } = useStarknetInvoke({
    contract,
    method: "batch_write_object_to_parcel",
  });
  const handleChangePhiland = useCallback((i: number, j: number, objectID: ObjectID) => {
    setPhiland((old) => {
      const copied = JSON.parse(JSON.stringify(old));
      copied[i][j] = objectID;
      return copied;
    });
  }, []);
  const fetchPhilandHolders = async (): Promise<PhilandHolder[]> => {
    const res = await axios.get<{ result: PhilandHolder[] }>(PHILAND_HOLDERS_API_ENDPOINT);
    return res.data.result;
  };
  const polling = useCallback(async () => {
    if (isCreatedPhilandRef.current) {
      return;
    } else {
      setRefleshPhilandHolders((old) => !old);
      await new Promise((resolve) => setTimeout(resolve, 1000 * 5));
      await polling();
    }
  }, [isCreatedPhilandRef]);
  const createPhiland = (): void => {
    if (!currentENS || window === undefined) return;

    // @ts-ignore
    const web3 = new Web3(window.ethereum);
    // @ts-ignore
    const contractL1 = new web3.eth.Contract(L1MessageAbi.abi, L1_MESSAGE_CONTRACT_ADDRESS);
    contractL1.methods
      .createPhiland(toBN(L2_PHILAND_CONTRACT_ADDRESS), currentENS.slice(0, -4))
      // @ts-ignore
      .send({ from: account }, (err, txHash) => {
        if (txHash) {
          toast(toastOption(txHash));
          polling();
        }
      });
  };
  const handleSave = useCallback(() => {
    invokeBatchWriteObject({
      args: [
        diff.x.map((x) => toBN(x)),
        diff.y.map((y) => toBN(y)),
        [stringToBN(currentENS), toBN(0)],
        diff.object.map((o) => toBN(o)),
      ],
    });
  }, [diff, currentENS]);

  useEffect(() => {
    if (isEmptyPhiland(dataPhiland)) return;

    const converted = convertPhiland(dataPhiland);
    handleCreatePhiland(true);
    setPrevPhiland(converted);
    setPhiland(converted);
  }, [dataPhiland]);

  useEffect(() => {
    if (isEmptyLinks(dataLinks)) return;

    setPhilandLink(convertPhilandLinks(dataLinks));
  }, [dataLinks]);

  useEffect(() => {
    (async () => {
      const holders = await fetchPhilandHolders();
      setPhilandHolders(holders);
      setIsCheckedPhilandHolder(true);
    })();
  }, [refleshPhilandHolders]);

  useEffect(() => {
    handleCreatePhiland(false);
    if (!isCreatedPhiland) {
      setPhiland(defaultPhiland);
      setPrevPhiland(defaultPhiland);
      setPhilandLink(defaultPhilandLinks);
    }

    philandHolders.forEach((holder) => {
      if (holder.ens === currentENS) {
        handleCreatePhiland(true);
      }
    });
  }, [currentENS, philandHolders]);

  return (
    <Center h="100%" w="100%" bgColor={isEdit ? "blackAlpha.100" : "white"}>
      {isCreatedPhiland ? (
        <>
          {isEdit ? (
            <>
              {diff.x.length ? (
                <Tooltip
                  label="Save"
                  placement="top"
                  color="blackAlpha.800"
                  bgColor="whiteAlpha.800"
                  openDelay={400}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  <IconButton
                    aria-label="Save"
                    position="absolute"
                    bottom="16"
                    right="16"
                    w="16"
                    h="16"
                    borderRadius="50%"
                    bgColor="blue.400"
                    boxShadow={`0 0 8px ${theme.colors.blue[200]}`}
                    icon={<RiSave3Line size="32px" color={theme.colors.white} />}
                    onClick={() => {
                      if (starknetAccount) {
                        handleSave();
                      } else {
                        connect(new InjectedConnector());
                      }
                    }}
                  />
                </Tooltip>
              ) : (
                <></>
              )}
            </>
          ) : (
            <Tooltip
              label="Share"
              placement="top"
              color="blackAlpha.800"
              bgColor="whiteAlpha.800"
              openDelay={400}
              fontFamily="monospace"
              fontWeight="bold"
            >
              <IconButton
                aria-label="Share"
                position="absolute"
                bottom="16"
                right="20"
                w="12"
                h="12"
                borderRadius="50%"
                colorScheme="twitter"
                boxShadow={`0 0 8px ${theme.colors.blue[200]}`}
                icon={<Image width="24px" height="24px" src={TwitterWhite} />}
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=Come visit my philand @phi_xyz%0a${frontendURL}/${currentENS}`,
                    "_blank"
                  );
                }}
              />
            </Tooltip>
          )}

          <Box position="absolute" left="24" top="0" pt="7" pl="2">
            <Text fontWeight="bold" fontSize="lg">
              {isEdit ? "Edit Mode" : "View Mode"}
            </Text>
            <Spacer mt="12" />
            <Tooltip
              isOpen={hasCopied}
              label="copied"
              placement="bottom-end"
              color="blackAlpha.800"
              bgColor="whiteAlpha.800"
            >
              <Text
                fontWeight="bold"
                fontSize="lg"
                cursor="pointer"
                color={hasCopied ? "blue.200" : "blue.400"}
                onClick={onCopy}
              >
                {formatENS(currentENS)}
                <CopyIcon w="12px" h="12px" ml="1" />
              </Text>
            </Tooltip>
          </Box>

          <Center>
            <SimpleGrid columns={1} boxShadow={`0 0 8px ${theme.colors.gray[300]}`}>
              {philand.map((row, i) => (
                <SimpleGrid key={`${i}_${row[i]}`} columns={8}>
                  {row.map((cell, j) => (
                    <Cell
                      key={`${i}_${philand[i]}_${j}_${philand[i][j]}_${philandLinks[i][j]}_${isEdit}`}
                      x={i}
                      y={j}
                      objectID={cell}
                      externalLink={philandLinks[i][j]}
                      isEdit={isEdit}
                      handleChange={(objectID) => handleChangePhiland(i, j, objectID)}
                    />
                  ))}
                </SimpleGrid>
              ))}
            </SimpleGrid>
          </Center>
        </>
      ) : (
        <>
          {currentENS ? (
            <>
              <Box position="absolute" left="24" top="0" mt="24" pl="2" alignItems="center">
                <Tooltip
                  isOpen={hasCopied}
                  label="copied"
                  placement="bottom-end"
                  color="blackAlpha.800"
                  bgColor="whiteAlpha.800"
                >
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    cursor="pointer"
                    color={hasCopied ? "blue.200" : "blue.400"}
                    onClick={onCopy}
                  >
                    {formatENS(currentENS)}
                    <CopyIcon w="12px" h="12px" ml="1" />
                  </Text>
                </Tooltip>
              </Box>

              <Center>
                <Button
                  onClick={createPhiland}
                  colorScheme="gray"
                  leftIcon={<Image width="24px" height="24px" src={PhiLogo} />}
                  fontWeight="bold"
                  fontSize="lg"
                  color="gray.800"
                  disabled={!isCheckedPhilandHolder}
                >
                  Create Philand
                </Button>
              </Center>
            </>
          ) : (
            <>
              {account ? (
                <VStack>
                  <Spinner color="gray.500" speed="0.7s" />
                  <Text color="gray.300" fontWeight="bold">
                    Resolving ENS Names...
                  </Text>
                  <Link
                    href="https://app.ens.domains"
                    isExternal
                    color="blue.300"
                    textDecoration="underline"
                    fontWeight="bold"
                  >
                    Get your ENS on Goerli testnet to get your land.
                  </Link>
                </VStack>
              ) : (
                <Search />
              )}
            </>
          )}
        </>
      )}
    </Center>
  );
};

export default Index;
