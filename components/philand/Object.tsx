import Image from "next/image";
import { VFC, useState, useEffect } from "react";
import axios from "axios";
import { Box, Tooltip } from "@chakra-ui/react";
import { useDrag } from "react-dnd";
import { ObjectID, ObjectMetadata, Metadata, defaultMetadata, MaterialMetadata, MaterialID } from "~/types";
import { L2_MATERIAL_CONTRACT_ADDRESS, L2_OBJECT_CONTRACT_ADDRESS } from "~/constants";

// ----- note: should load from IPFS -----
import GameCenter from "~/public/objects/Game center.png";
import Taxi from "~/public/objects/Taxi.png";
import GreenCar from "~/public/objects/Green car.png";
import HeartDevice from "~/public/objects/Heart Device.png";
import House from "~/public/objects/House.png";
import LootStone from "~/public/objects/Loot Stone.png";
import UniswapRockingHorse from "~/public/objects/Uniswap Rocking Horse.png";
import UniswapMerryGoRound from "~/public/objects/Uniswap Merry-go-round.png";
import UniswapBank from "~/public/objects/Uniswap Bank.png";
import VotersMonument from "~/public/objects/Voter’s Monument.png";
import ETHSalon from "~/public/objects/ETH Salon.png";
import SpriteBox from "~/public/objects/Sprite-Box.png";
import Soil from "~/public/soil.png";
const ObjectImages: { [key in ObjectID]: StaticImageData } = {
  1: GameCenter,
  2: Taxi,
  3: GreenCar,
  4: HeartDevice,
  5: House,
  6: LootStone,
  7: UniswapRockingHorse,
  8: UniswapMerryGoRound,
  9: UniswapBank,
  10: VotersMonument,
  11: ETHSalon,
  12: SpriteBox,
};
const MaterialImages: { [key in MaterialID]: StaticImageData } = {
  1: Soil,
};
// -------------------------------------------

const ObjectComponent: VFC<{
  contractAddress: typeof L2_OBJECT_CONTRACT_ADDRESS | typeof L2_MATERIAL_CONTRACT_ADDRESS;
  size: number;
  canDrag: boolean;
  objectID: ObjectID;
  handleAfterDrop?: (objectID: ObjectID) => void;
  handleDragging?: () => void;
}> = ({ contractAddress, size, canDrag, objectID, handleAfterDrop, handleDragging }) => {
  const [metadata, setMetadata] = useState<Metadata>(defaultMetadata);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "OBJECT",
      item: { name: objectID },
      end: (item, monitor) => {
        if (monitor.didDrop() && handleAfterDrop) {
          handleAfterDrop(item.name);
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(), // memo: styling
      }),
      canDrag: canDrag,
    }),
    [objectID]
  );

  useEffect(() => {
    if (isDragging && handleDragging) {
      handleDragging();
    }
  }, [isDragging]);

  useEffect(() => {
    if (!objectID) return;

    (async () => {
      const url =
        contractAddress === L2_OBJECT_CONTRACT_ADDRESS ? ObjectMetadata[objectID] : MaterialMetadata[objectID];
      const res = await axios.get<Metadata>(url);
      setMetadata(res.data);
    })();
  }, []);

  return (
    <Box ref={drag} cursor="pointer">
      <Tooltip
        label={metadata.description}
        placement="top"
        color="blackAlpha.800"
        bgColor="whiteAlpha.800"
        openDelay={600}
        fontWeight="bold"
        shouldWrapChildren
        offset={[0, 30]}
      >
        <Image
          width={`${size}px`}
          height={`${size}px`}
          src={
            {
              [L2_OBJECT_CONTRACT_ADDRESS]: ObjectImages[objectID],
              [L2_MATERIAL_CONTRACT_ADDRESS]: MaterialImages[objectID],
            }[contractAddress]
          }
        />
      </Tooltip>
    </Box>
  );
};

export default ObjectComponent;
