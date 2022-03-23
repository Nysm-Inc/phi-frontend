import Image from "next/image";
import { useContext, useEffect } from "react";
import { hooks, metaMask } from "~/connectors/metamask";
import { Button, Text } from "@chakra-ui/react";
import { MetamaskLogo } from "~/public";
import { AppContext } from "~/contexts";

const { useChainId } = hooks;

const WalletEthereum = () => {
  const chainID = useChainId();
  const { account } = useContext(AppContext);

  useEffect(() => {
    metaMask.activate(5);
  }, [chainID]);

  return (
    <>
      {!account ? (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Image src={MetamaskLogo} width="16px" height="16px" />}
          onClick={() => {
            try {
              metaMask.activate(5);
            } catch (error) {}
          }}
        >
          <Text fontSize="sm" fontWeight="bold">
            Connect Wallet
          </Text>
        </Button>
      ) : (
        <Button size="sm" leftIcon={<Image src={MetamaskLogo} width="16px" height="16px" />}>
          <Text fontSize="sm" fontWeight="bold">
            {account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : "No Account"}
          </Text>
        </Button>
      )}
    </>
  );
};

export default WalletEthereum;
