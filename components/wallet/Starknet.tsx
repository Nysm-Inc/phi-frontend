import Image from "next/image";
import { useEffect, useContext, useState } from "react";
import { InjectedConnector, useStarknet } from "@starknet-react/core";
import { Button, Text } from "@chakra-ui/react";
import { ArgentLogo } from "~/public";
import { AppContext } from "~/contexts";

const WalletStarknet = () => {
  const { handleStarknetAccount } = useContext(AppContext);
  const { account: starknetAccount, connect } = useStarknet();
  const [reflesh, setReflesh] = useState(false);

  useEffect(() => {
    if (!starknetAccount) {
      connect(new InjectedConnector());
    } else {
      handleStarknetAccount(starknetAccount);
    }
  }, [starknetAccount, connect, handleStarknetAccount, reflesh]);

  useEffect(() => {
    setTimeout(() => setReflesh(true), 1000);
  }, []);

  return (
    <>
      {!starknetAccount ? (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Image src={ArgentLogo} width="16px" height="16px" />}
          onClick={() => connect(new InjectedConnector())}
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
