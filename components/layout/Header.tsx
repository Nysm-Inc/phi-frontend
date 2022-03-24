import Link from "next/link";
import Image from "next/image";
import { Contract } from "ethers";
import { Flex, Text, Center, useToast, Button, Spacer, Spinner, Tooltip } from "@chakra-ui/react";
import crypto from "crypto";
import { Search } from "~/components/philand";
import { WalletEthereum, WalletStarknet } from "~/components/wallet";
import { PhiLogo, EnsLogo } from "~/public";
import { ENSControllerAbi } from "~/abi";
import { ENS_CONTROLLER_CONTRACT_ADDRESS, ENS_RESOLVER_CONTRACT_ADDRESS } from "~/constants";
import { toastOption } from "../transaction";
import { format } from "date-fns";
import { FC, useContext, useState } from "react";
import { AppContext } from "~/contexts";
import { hooks } from "~/connectors/metamask";

const { useProvider } = hooks;

const Header: FC<{ callbackGetENS?: () => void }> = ({ callbackGetENS }) => {
  const toast = useToast();
  const { account } = useContext(AppContext);
  const provider = useProvider();

  const [domain, setDomain] = useState("");
  const [secret, setSecret] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const commit = async () => {
    const signer = provider.getSigner();
    const controllerContract = new Contract(ENS_CONTROLLER_CONTRACT_ADDRESS, ENSControllerAbi, signer);

    const label = `phi${format(new Date(), "MMddHHmmSSsss")}`;
    const salt = "0x" + crypto.randomBytes(32).toString("hex");
    const commitment = await controllerContract.makeCommitmentWithConfig(
      label,
      account,
      salt,
      ENS_RESOLVER_CONTRACT_ADDRESS,
      account
    );
    const tx = await controllerContract.commit(commitment);
    if (tx) {
      setDomain(label);
      setSecret(salt);
      setStep(2);
      setTimeout(() => {
        setStep(3);
      }, 1000 * 60 * 2);
      toast(toastOption(tx.hash));
    }
  };

  const register = async () => {
    const signer = provider.getSigner();
    const controllerContract = new Contract(ENS_CONTROLLER_CONTRACT_ADDRESS, ENSControllerAbi, signer);

    const duration = 31556952; // 365 days
    const price = await controllerContract.rentPrice(domain, duration);
    const priceWithBuffer = price.mul(11).div(10);

    const tx = await controllerContract.registerWithConfig(
      domain,
      account,
      duration,
      secret,
      ENS_RESOLVER_CONTRACT_ADDRESS,
      account,
      { value: priceWithBuffer, gasLimit: 500000 }
    );
    if (tx) {
      toast(toastOption(tx.hash));
      setTimeout(() => {
        setStep(1);
        callbackGetENS();
      }, 1000 * 30);
    }
  };

  return (
    <Flex w="100%" h="20" justifyContent="space-between" alignItems="center" pl="6" pr="6">
      <Link href="/" passHref>
        <Center paddingLeft="4" cursor="pointer">
          <Image width="32px" height="32px" src={PhiLogo} />
        </Center>
      </Link>

      <Flex alignItems="center">
        <Tooltip
          shouldWrapChildren
          placement="bottom"
          color="blackAlpha.800"
          bgColor="whiteAlpha.800"
          fontWeight="bold"
          label={
            {
              1: "Your wallet will open and you will be asked to confirm the first of two transactions required for registration. If the second transaction is not processed within 7 days of the first, you will need to start again from step 1.",
              2: "The waiting period is required to ensure another person hasn’t tried to register the same name and protect you after your request.",
              3: "Click Complete Registration and your wallet will re-open. Only after the 2nd transaction is confirmed you'll know if you got the name.",
            }[step]
          }
        >
          <Button
            variant="outline"
            leftIcon={<Image src={EnsLogo} width="16px" height="16px" />}
            rightIcon={step === 2 ? <Spinner color="gray.400" speed="0.7s" size="sm" /> : <></>}
            disabled={step === 2}
            onClick={() => {
              if (step === 1) commit();
              if (step === 3) register();
            }}
          >
            <Text fontSize="sm" fontWeight="bold">
              {
                {
                  1: "Get ENS on Goerli",
                  2: "Wait for 1 minute",
                  3: "Complete Registration",
                }[step]
              }
              {` (${step}/3)`}
            </Text>
          </Button>
        </Tooltip>
        <Spacer ml="2" />
        <Search />
        <Spacer ml="2" />
        <WalletEthereum />
        <Spacer ml="2" />
        <WalletStarknet />
      </Flex>
    </Flex>
  );
};

export default Header;
