import { useRouter } from "next/router";
import Image from "next/image";
import { FC, useState, useCallback, useEffect, useContext } from "react";
import Web3 from "web3";
import { metaMask } from "~/connectors/metamask";
import { Abi, shortString } from "starknet";
import { useStarknet, useContract, useStarknetInvoke, InjectedConnector } from "@starknet-react/core";
import {
  Box,
  Text,
  StackDivider,
  VStack,
  IconButton,
  Modal,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useTheme,
  SimpleGrid,
  Center,
  Spacer,
  Flex,
  Link,
  useToast,
  ModalFooter,
} from "@chakra-ui/react";
import { RiEdit2Fill, RiArrowGoBackFill, RiQuestionFill } from "react-icons/ri";
import { AiFillHome } from "react-icons/ai";
import { EnsLogo, Soil, Uniswap, LootBalance, Twitter, Discord } from "~/public";
import { ObjectID, ObjectNameMap, defaultCoupon, CouponConditionMap, MaterialNameMap, tileList } from "~/types";
import { stringToBN, toBN } from "~/utils/cairo";
import { formatENS } from "~/utils/ens";
import { L1MessageAbi, L2LoginAbi, L2MaterialAbi, L2PhilandAbi } from "~/abi";
import {
  currentENSKey,
  DISCORD_URL,
  HOW_TO_CLAIM_OBJECT,
  HOW_TO_PLAY_URL,
  L1_MESSAGE_CONTRACT_ADDRESS,
  L2_LOGIN_CONTRACT_ADDRESS,
  L2_MATERIAL_CONTRACT_ADDRESS,
  L2_OBJECT_CONTRACT_ADDRESS,
  L2_PHILAND_CONTRACT_ADDRESS,
  MetaCraftedMaterialContractAddress,
  MetaPrimitiveMaterialContractAddress,
  TWITTER_URL,
} from "~/constants";
import { TrackTxStarknet, toastOption } from "~/components/transaction";
import { AppContext } from "~/contexts";
import { ObjectComponent } from "~/components/philand";
import Header from "./Header";
import Head from "./Head";
import LayoutTooltip from "./Tooltip";
import { ModalMenu, MyObject, ClaimObject } from "./types";
import { fetchMetaCraftedMaterials, fetchMetaPrimitiveMaterials, fetchMyObjects, getCoupon } from "~/utils/object";

const Layout: FC = ({ children }) => {
  const {
    account,
    starknetAccount,
    currentENS,
    ownedDomains,
    isEdit,
    isCreatedPhiland,
    handleEdit,
    refleshOwnedDomains,
  } = useContext(AppContext);
  const theme = useTheme();
  const toast = useToast();
  const router = useRouter();
  const { connect } = useStarknet();
  const { contract: loginContract } = useContract({
    abi: L2LoginAbi as Abi,
    address: L2_LOGIN_CONTRACT_ADDRESS,
  });
  const { contract: philandContract } = useContract({
    abi: L2PhilandAbi as Abi,
    address: L2_PHILAND_CONTRACT_ADDRESS,
  });
  const { contract: materialContract } = useContract({
    abi: L2MaterialAbi as Abi,
    address: L2_MATERIAL_CONTRACT_ADDRESS,
  });

  const [myObjects, setMyObjects] = useState<MyObject[]>([]);
  const [claimObjects, setClaimObjects] = useState<ClaimObject[]>([
    { objectID: 6, isClaimable: false, coupon: defaultCoupon },
    { objectID: 7, isClaimable: false, coupon: defaultCoupon },
    { objectID: 8, isClaimable: false, coupon: defaultCoupon },
    { objectID: 9, isClaimable: false, coupon: defaultCoupon },
    { objectID: 10, isClaimable: false, coupon: defaultCoupon },
    { objectID: 11, isClaimable: false, coupon: defaultCoupon },
    { objectID: 12, isClaimable: false, coupon: defaultCoupon },
  ]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMenu, setModalMenu] = useState<ModalMenu>(undefined);
  const [refleshMyObjects, setRefleshMyObjects] = useState(false);

  const { invoke: invokeClaimStarterkit } = useStarknetInvoke({
    contract: philandContract,
    method: "claim_starter_object",
  });
  const handleChangeMyObjects = useCallback(
    (objectID: ObjectID) => {
      const idx = myObjects.findIndex(
        (o) => o.objectID === objectID && o.contractAddress === L2_OBJECT_CONTRACT_ADDRESS
      );
      setMyObjects((old) => old.filter((o, i) => i !== idx));
    },
    [myObjects]
  );
  const handleOpenMyLands = useCallback(() => {
    refleshOwnedDomains();
    setModalMenu("my_lands");
    onOpen();
  }, []);
  const handleOpenMyObjects = useCallback(() => {
    setRefleshMyObjects((old) => !old);
    setModalMenu("my_objects");
    onOpen();
  }, []);
  const handleOpenClaimObjects = useCallback(() => {
    setModalMenu("claim_objects");
    onOpen();
  }, []);
  const claimObject = useCallback(
    (claimObject: ClaimObject): void => {
      if (!currentENS) return;

      // @ts-ignore
      const web3 = new Web3(window.ethereum);
      // @ts-ignore
      const contractL1 = new web3.eth.Contract(L1MessageAbi.abi, L1_MESSAGE_CONTRACT_ADDRESS);

      let condition = CouponConditionMap[claimObject.objectID].objectName;
      const conditionValue = CouponConditionMap[claimObject.objectID].value;
      if (conditionValue) {
        condition += conditionValue;
      }
      contractL1.methods
        .claimL2Object(
          toBN(L2_PHILAND_CONTRACT_ADDRESS),
          currentENS.slice(0, -4),
          toBN(starknetAccount),
          claimObject.objectID,
          condition,
          [claimObject.coupon["r"], claimObject.coupon["s"], claimObject.coupon["v"]]
        )
        // @ts-ignore
        .send({ from: account }, (err, txHash) => {
          if (txHash) {
            toast(toastOption(txHash));
          }
        });
    },
    [currentENS, starknetAccount]
  );

  useEffect(() => {
    if (!account) return;

    Promise.all([
      getCoupon(account, 6),
      getCoupon(account, 7),
      getCoupon(account, 8),
      getCoupon(account, 9),
      getCoupon(account, 10),
      getCoupon(account, 11),
      getCoupon(account, 12),
    ]).then((coupons) => {
      const copied: ClaimObject[] = JSON.parse(JSON.stringify(claimObjects));
      coupons.forEach((coupon) => {
        if (coupon.coupon) {
          copied.forEach((c, i) => {
            if (coupon.objectID === c.objectID) {
              copied[i] = { ...copied[i], isClaimable: true, coupon: coupon.coupon };
            }
          });
        }
      });

      setClaimObjects(copied);
    });
  }, [account]);

  useEffect(() => {
    if (!starknetAccount || isEdit) return;

    (async () => {
      const fetchObjects: MyObject[] = [];
      const response = await Promise.all([
        fetchMyObjects(starknetAccount),
        fetchMetaPrimitiveMaterials(starknetAccount),
        fetchMetaCraftedMaterials(starknetAccount),
      ]);

      response.forEach((res) => {
        res.list.forEach((object, i) => {
          [...new Array(object)].forEach(() => {
            // todo
            let objectID = i;
            let address = res.contractAddress;
            if (res.contractAddress === MetaPrimitiveMaterialContractAddress) {
              objectID += 12;
              address = L2_OBJECT_CONTRACT_ADDRESS;
            }
            if (res.contractAddress === MetaCraftedMaterialContractAddress) {
              objectID += 16;
              address = L2_OBJECT_CONTRACT_ADDRESS;
            }
            fetchObjects.push({
              objectID: objectID + 1,
              isPuttable: address === L2_OBJECT_CONTRACT_ADDRESS,
              // @ts-ignore
              contractAddress: address,
            });
          });
        });
      });
      setMyObjects(fetchObjects);
    })();
  }, [starknetAccount, refleshMyObjects, isEdit]);

  return (
    <>
      <Head />

      <VStack w="100vw" h="100vh" divider={<StackDivider borderColor="gray.200" margin="0 !important" />}>
        <Header callbackGetENS={handleOpenMyLands} />
        {!account && !starknetAccount && (
          <Center
            h="24"
            bgColor="whiteAlpha.800"
            fontWeight="bold"
            borderRadius="xl"
            p="4"
            position="absolute"
            top={theme.space[16]}
            right={theme.space[4]}
            zIndex={1}
            boxShadow={`0 0 12px ${theme.colors.gray[200]}`}
          >
            <VStack>
              <Text fontWeight="bold">Get Your ENS Land!</Text>
              <Text fontWeight="bold">Connect Metamask Wallet with Goerli testnet.</Text>
              <Text fontWeight="bold">Connect Argent Wallet with Goerli testnet.</Text>
            </VStack>
          </Center>
        )}

        <Box position="relative" w="100%" h="100%">
          <VStack position="absolute" w="24" h="100%" border="1px solid" borderColor="gray.100" bgColor="white">
            <Box />
            {router.pathname === "/" ? (
              <>
                {isEdit ? (
                  <LayoutTooltip label="Back">
                    <IconButton
                      w="16"
                      h="16"
                      bgColor="white"
                      aria-label="back"
                      icon={<RiArrowGoBackFill size="40px" color={theme.colors.gray[600]} />}
                      onClick={() => handleEdit(false)}
                    />
                  </LayoutTooltip>
                ) : (
                  <LayoutTooltip label="Edit">
                    <IconButton
                      w="16"
                      h="16"
                      bgColor="white"
                      aria-label="edit"
                      disabled={!isCreatedPhiland}
                      icon={<RiEdit2Fill size="40px" color={theme.colors.gray[600]} />}
                      onClick={() => handleEdit(true)}
                    />
                  </LayoutTooltip>
                )}
              </>
            ) : (
              <LayoutTooltip label="Home">
                <IconButton
                  w="16"
                  h="16"
                  bgColor="white"
                  aria-label="edit"
                  icon={<AiFillHome size="40px" color={theme.colors.gray[600]} />}
                  onClick={() => {
                    window.location.href = "/";
                  }}
                />
              </LayoutTooltip>
            )}

            <LayoutTooltip label="My Lands">
              <IconButton
                w="16"
                h="16"
                bgColor="white"
                aria-label="my_lands"
                disabled={router.pathname !== "/"}
                icon={<Image src={EnsLogo} width="40px" height="40px" />}
                onClick={() => {
                  if (account) {
                    handleOpenMyLands();
                  } else {
                    metaMask.activate(5);
                  }
                }}
              />
            </LayoutTooltip>
            <LayoutTooltip label="My Objects">
              <IconButton
                w="16"
                h="16"
                bgColor="white"
                aria-label="my_objects"
                disabled={router.pathname !== "/"}
                icon={<Image src={Uniswap} width="40px" height="40px" />}
                onClick={() => {
                  if (starknetAccount) {
                    handleOpenMyObjects();
                  } else {
                    connect(new InjectedConnector());
                  }
                }}
              />
            </LayoutTooltip>
            <LayoutTooltip label="Claim Objects">
              <IconButton
                w="16"
                h="16"
                bgColor="white"
                aria-label="claim_objects"
                disabled={router.pathname !== "/"}
                icon={<Image src={LootBalance} width="40px" height="40px" />}
                onClick={() => {
                  if (starknetAccount) {
                    handleOpenClaimObjects();
                  } else {
                    connect(new InjectedConnector());
                  }
                }}
              />
            </LayoutTooltip>
            <VStack position="absolute" w="100%" bottom="4">
              <Flex w="100%" justifyContent="space-evenly">
                <Link href={TWITTER_URL} isExternal>
                  <Image width="20px" height="20px" src={Twitter} />
                </Link>
                <Link href={DISCORD_URL} isExternal>
                  <Image width="20px" height="20px" src={Discord} />
                </Link>
                <Link href={HOW_TO_PLAY_URL} isExternal>
                  <RiQuestionFill color={theme.colors.gray[400]} size="20px" />
                </Link>
              </Flex>
            </VStack>
          </VStack>

          {children}
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent minHeight="xl" bgColor="whiteAlpha.800">
            <ModalHeader>
              <ModalCloseButton />
              <Center>
                <Text fontWeight="bold" fontSize="2xl">
                  {
                    {
                      my_lands: <>Select Your Land</>,
                      my_objects: <>Put Objects</>,
                      claim_objects: <>Claim Your Objects</>,
                      login_bonus: <>You got a Soil Block!</>,
                    }[modalMenu]
                  }
                </Text>
              </Center>
              <Spacer mt="2" />
            </ModalHeader>
            <ModalBody>
              <SimpleGrid columns={4} spacing="2">
                {
                  {
                    my_lands: (
                      <>
                        {ownedDomains.map((domain) => (
                          <Center
                            key={domain}
                            position="relative"
                            bgColor="blue.50"
                            w="32"
                            h="32"
                            borderRadius="md"
                            {...(domain === currentENS
                              ? {
                                  border: "2px solid",
                                  borderColor: "blue.400",
                                }
                              : {
                                  cursor: "pointer",
                                  onClick: () => {
                                    if (shortString.isShortString(domain)) {
                                      localStorage.setItem(currentENSKey, domain);
                                      location.reload();
                                    }
                                  },
                                })}
                            {...(!shortString.isShortString(domain) && {
                              opacity: 0.5,
                              cursor: "default",
                            })}
                          >
                            <Image width="48px" height="48px" src={EnsLogo} />
                            <Text position="absolute" color="blue.400" bottom="2" fontWeight="bold" fontSize="xs">
                              {formatENS(domain)}
                            </Text>
                          </Center>
                        ))}
                      </>
                    ),
                    my_objects: (
                      <>
                        {myObjects.map((object, i) => (
                          <Center
                            key={`${object.objectID}_${i}`}
                            w="32"
                            h="32"
                            borderRadius="md"
                            // todo
                            // bgImage="url(/land.svg)"
                            bgImage={
                              tileList.includes(object.objectID)
                                ? `url("/meta_objects/${ObjectNameMap[object.objectID]}.png")`
                                : "url(/land.svg)"
                            }
                            position="relative"
                            opacity={object.isPuttable ? 1 : 0.5}
                          >
                            <ObjectComponent
                              contractAddress={object.contractAddress}
                              size={64}
                              canDrag={isEdit && object.isPuttable}
                              objectID={object.objectID}
                              handleAfterDrop={handleChangeMyObjects}
                              handleDragging={onClose}
                            />
                            <Text
                              position="absolute"
                              bottom="2"
                              color="blackAlpha.800"
                              fontWeight="bold"
                              fontSize="xs"
                              textAlign="center"
                              lineHeight="none"
                            >
                              {
                                {
                                  [L2_OBJECT_CONTRACT_ADDRESS]: ObjectNameMap[object.objectID],
                                  [L2_MATERIAL_CONTRACT_ADDRESS]: MaterialNameMap[object.objectID],
                                }[object.contractAddress]
                              }
                            </Text>
                          </Center>
                        ))}
                      </>
                    ),
                    claim_objects: (
                      <>
                        {claimObjects.map((object) => (
                          <Center
                            key={object.objectID}
                            w="32"
                            h="32"
                            borderRadius="md"
                            bgImage="url(/land.svg)"
                            position="relative"
                            cursor="pointer"
                            opacity={object.isClaimable ? 1 : 0.5}
                            onClick={() => {
                              if (starknetAccount) {
                                if (object.isClaimable) {
                                  claimObject(object);
                                }
                              } else {
                                connect(new InjectedConnector());
                              }
                            }}
                          >
                            <ObjectComponent
                              contractAddress={L2_OBJECT_CONTRACT_ADDRESS}
                              size={64}
                              canDrag={false}
                              objectID={object.objectID}
                              handleDragging={onClose}
                            />
                            <Text
                              position="absolute"
                              bottom="2"
                              color="blackAlpha.800"
                              fontWeight="bold"
                              fontSize="xs"
                              textAlign="center"
                              lineHeight="none"
                            >
                              {ObjectNameMap[object.objectID]}
                            </Text>
                          </Center>
                        ))}
                        <Center
                          key="starterkit"
                          w="32"
                          h="32"
                          borderRadius="md"
                          bgImage="url(/land.svg)"
                          position="relative"
                          cursor="pointer"
                          opacity={true ? 1 : 0.5}
                          onClick={() => {
                            if (starknetAccount) {
                              if (true) {
                                invokeClaimStarterkit({
                                  args: [[stringToBN(currentENS), toBN(0)], toBN(starknetAccount)],
                                });
                              }
                            } else {
                              connect(new InjectedConnector());
                            }
                          }}
                        >
                          <ObjectComponent
                            contractAddress={L2_OBJECT_CONTRACT_ADDRESS}
                            size={64}
                            canDrag={false}
                            objectID={1}
                          />
                          <Text
                            position="absolute"
                            bottom="2"
                            color="blackAlpha.800"
                            fontWeight="bold"
                            fontSize="xs"
                            textAlign="center"
                            lineHeight="normal"
                          >
                            StarterKit
                          </Text>
                        </Center>
                      </>
                    ),
                    login_bonus: (
                      <Center>
                        <Image width="64px" height="64px" src={Soil} />
                      </Center>
                    ),
                  }[modalMenu]
                }
              </SimpleGrid>
            </ModalBody>
            <ModalFooter justifyContent="center">
              {
                {
                  my_lands: <></>,
                  my_objects: <></>,
                  claim_objects: (
                    <Link href={HOW_TO_CLAIM_OBJECT} isExternal fontWeight="bold" textDecoration="underline">
                      How to claim object
                    </Link>
                  ),
                  login_bonus: <></>,
                }[modalMenu]
              }
            </ModalFooter>
          </ModalContent>
        </Modal>

        <TrackTxStarknet />
      </VStack>
    </>
  );
};

export default Layout;
