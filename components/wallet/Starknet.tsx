import Image from "next/image";
import { useEffect, useCallback, useContext } from "react";
import { getStarknet } from "@argent/get-starknet";
import { Button, Text } from "@chakra-ui/react";
import { ArgentLogo } from "~/public";
import { AppContext } from "~/contexts";

const WalletStarknet = () => {
  const { starknetAccount, handleStarknetAccount } = useContext(AppContext);
  const starknet = getStarknet();

  const checkMissingWallet = useCallback(async () => {
    try {
      const accounts = await starknet.enable();
      handleStarknetAccount(accounts ? accounts[0] : "");
    } catch (e) {}
  }, [starknet]);

  useEffect(() => {
    checkMissingWallet();
  }, [checkMissingWallet]);

  return (
    <>
      {!starknetAccount ? (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Image src={ArgentLogo} width="16px" height="16px" />}
          onClick={checkMissingWallet}
        >
          <Text fontSize="sm" fontWeight="bold">
            Connect Wallet
          </Text>
        </Button>
      ) : (
        <Button size="sm" leftIcon={<Image src={ArgentLogo} width="16px" height="16px" />}>
          <Text fontSize="sm" fontWeight="bold">
            {starknetAccount
              ? `${starknetAccount.substring(0, 4)}...${starknetAccount.substring(starknetAccount.length - 4)}`
              : "No Account"}
          </Text>
        </Button>
      )}
    </>
  );
};

export default WalletStarknet;
