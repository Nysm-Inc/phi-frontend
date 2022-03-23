import { FC } from "react";
import { Tooltip } from "@chakra-ui/react";

const LayoutTooltip: FC<{ label: string }> = ({ label, children }) => (
  <Tooltip
    label={label}
    placement="right-end"
    color="blackAlpha.800"
    bgColor="whiteAlpha.800"
    openDelay={400}
    fontWeight="bold"
  >
    {children}
  </Tooltip>
);

export default LayoutTooltip;
