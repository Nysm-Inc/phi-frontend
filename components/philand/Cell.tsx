import { VFC, useState, useContext } from "react";
import { useDrop } from "react-dnd";
import {
  Center,
  Popover,
  PopoverTrigger,
  PopoverContent,
  SimpleGrid,
  IconButton,
  InputGroup,
  InputRightElement,
  Input,
  useTheme,
  Tooltip,
} from "@chakra-ui/react";
import { RiExternalLinkLine, RiDeleteBin6Line, RiCheckFill } from "react-icons/ri";
import { Abi } from "starknet";
import { useStarknet, useContract, useStarknetInvoke, InjectedConnector } from "@starknet-react/core";
import { ObjectID, ObjectNameMap, tileList } from "~/types";
import { L2_MATERIAL_CONTRACT_ADDRESS, L2_OBJECT_CONTRACT_ADDRESS, L2_PHILAND_CONTRACT_ADDRESS } from "~/constants";
import { L2PhilandAbi } from "~/abi";
import { toBN, stringToBN } from "~/utils/cairo";
import { AppContext } from "~/contexts";
import { ObjectComponent } from ".";

const Cell: VFC<{
  x: number;
  y: number;
  objectID: ObjectID;
  contractAddress: typeof L2_OBJECT_CONTRACT_ADDRESS | typeof L2_MATERIAL_CONTRACT_ADDRESS;
  externalLink: string;
  isEdit: boolean;
  handleChange?: (objectID: ObjectID) => void;
}> = ({ x, y, objectID, contractAddress, externalLink, isEdit, handleChange }) => {
  const theme = useTheme();
  const { contract } = useContract({ abi: L2PhilandAbi as Abi, address: L2_PHILAND_CONTRACT_ADDRESS });
  const { connect } = useStarknet();
  const { starknetAccount, currentENS } = useContext(AppContext);

  const [linkText, setLinkText] = useState(externalLink);

  const { invoke } = useStarknetInvoke({ contract, method: "write_link" });
  const writeLink = () => {
    if (!starknetAccount) {
      connect(new InjectedConnector());
      return;
    }

    invoke({
      args: [
        [stringToBN(currentENS), toBN(0)],
        toBN(x),
        toBN(y),
        toBN(L2_PHILAND_CONTRACT_ADDRESS),
        [stringToBN(linkText), toBN(0)],
      ],
    });
  };
  const [{ canDrop }, drop] = useDrop(
    () => ({
      accept: "OBJECT",
      canDrop: () => objectID === 0 && isEdit,
      // @ts-ignore
      drop: (item, monitor) => handleChange(item.id),
      collect: (monitor) => ({
        canDrop: monitor.canDrop(), // memo: styling
      }),
    }),
    [objectID]
  );

  return (
    <>
      {isEdit ? (
        <Popover>
          <PopoverTrigger>
            <Center
              ref={drop}
              // todo
              // bgImage="url(/land.svg)"
              bgImage={
                tileList.includes(objectID) ? `url("/meta_objects/${ObjectNameMap[objectID]}.png")` : "url(/land.svg)"
              }
              cursor="pointer"
              w="16"
              h="16"
              border="0.5px solid"
              borderColor="gray.50"
              {...(externalLink && {
                zIndex: 1,
                boxShadow: `0 0 8px ${theme.colors.pink[300]}`,
                opacity: 0.8,
              })}
            >
              {objectID ? (
                <ObjectComponent
                  contractAddress={contractAddress}
                  size={48}
                  canDrag={isEdit}
                  objectID={objectID}
                  handleAfterDrop={(objectID: number) => handleChange(0)}
                />
              ) : (
                <></>
              )}
            </Center>
          </PopoverTrigger>
          <PopoverContent w="24" h="12" _focus={{ boxShadow: "none" }} _focusVisible={{ outline: "none" }}>
            <Center w="100%" h="100%">
              <SimpleGrid columns={2}>
                <Popover>
                  <PopoverTrigger>
                    <IconButton
                      size="lg"
                      icon={<RiExternalLinkLine />}
                      aria-label="link"
                      bgColor="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius={0}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    w="48"
                    h="8"
                    border="none"
                    _focus={{ boxShadow: "none" }}
                    _focusVisible={{ outline: "none" }}
                  >
                    <Center w="100%" h="100%">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          writeLink();
                        }}
                      >
                        <InputGroup>
                          <InputRightElement>
                            <RiCheckFill
                              {...(externalLink !== linkText
                                ? {
                                    cursor: "pointer",
                                    color: theme.colors.gray[600],
                                    onClick: () => writeLink(),
                                  }
                                : { color: theme.colors.gray[300] })}
                            />
                          </InputRightElement>
                          <Input placeholder="" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
                        </InputGroup>
                      </form>
                    </Center>
                  </PopoverContent>
                </Popover>
                <IconButton
                  size="lg"
                  icon={<RiDeleteBin6Line />}
                  aria-label="link"
                  bgColor="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius={0}
                  disabled={!objectID}
                  onClick={() => handleChange(0)}
                />
              </SimpleGrid>
            </Center>
          </PopoverContent>
        </Popover>
      ) : (
        <Tooltip
          label={externalLink}
          color="pink.300"
          bgColor="whiteAlpha.800"
          boxShadow={`0 0 8px ${theme.colors.pink[300]}`}
          fontWeight="bold"
        >
          <Center
            ref={drop}
            // todo
            // bgImage="url(/land.svg)"
            bgImage={
              tileList.includes(objectID) ? `url("/meta_objects/${ObjectNameMap[objectID]}.png")` : "url(/land.svg)"
            }
            cursor="pointer"
            w="20"
            h="20"
            {...(externalLink && {
              zIndex: 1,
              boxShadow: `0 0 8px ${theme.colors.pink[300]}`,
              opacity: 0.8,
              onClick: () => {
                if (linkText.match(/^.+\.eth$/g)) {
                  window.location.href = externalLink;
                }
              },
            })}
          >
            {objectID ? (
              <ObjectComponent
                contractAddress={contractAddress}
                size={48}
                canDrag={isEdit}
                objectID={objectID}
                handleAfterDrop={(objectID: number) => handleChange(0)}
              />
            ) : (
              <></>
            )}
          </Center>
        </Tooltip>
      )}
    </>
  );
};

export default Cell;
