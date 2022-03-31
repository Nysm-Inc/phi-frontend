import Image from "next/image";
import { VFC, useState, useEffect } from "react";
import axios from "axios";
import { Box, Tooltip } from "@chakra-ui/react";
import { useDrag } from "react-dnd";
import { ObjectID, ObjectMetadata, Metadata, defaultMetadata, MaterialMetadata } from "~/types";
import { L2_MATERIAL_CONTRACT_ADDRESS, L2_OBJECT_CONTRACT_ADDRESS } from "~/constants";
import { MaterialImages, ObjectImages } from "./objectImage";

const ObjectComponent: VFC<{
  contractAddress: typeof L2_OBJECT_CONTRACT_ADDRESS | typeof L2_MATERIAL_CONTRACT_ADDRESS;
  size: number;
  canDrag: boolean;
  objectID: ObjectID;
  handleAfterDrop?: (objectID: ObjectID) => void;
  handleDragging?: () => void;
}> = ({ contractAddress, size, canDrag, objectID, handleAfterDrop, handleDragging }) => {
  const [metadata, setMetadata] = useState<Metadata>(defaultMetadata);
  const src = {
    [L2_OBJECT_CONTRACT_ADDRESS]: ObjectImages[objectID],
    [L2_MATERIAL_CONTRACT_ADDRESS]: MaterialImages[objectID],
  }[contractAddress];

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "OBJECT",
      item: { id: objectID },
      end: (item, monitor) => {
        if (monitor.didDrop() && handleAfterDrop) {
          handleAfterDrop(item.id);
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
      const url = {
        [L2_OBJECT_CONTRACT_ADDRESS]: ObjectMetadata[objectID],
        [L2_MATERIAL_CONTRACT_ADDRESS]: MaterialMetadata[objectID],
      }[contractAddress];
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
        {src ? <Image width={`${size}px`} height={`${size}px`} src={src} /> : <></>}
      </Tooltip>
    </Box>
  );
};

export default ObjectComponent;
