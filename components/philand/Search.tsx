import { useState } from "react";
import { InputGroup, InputLeftElement, InputRightElement, Input, Text, HStack } from "@chakra-ui/react";
import { SearchIcon, ArrowForwardIcon } from "@chakra-ui/icons";

const Search = () => {
  const [searchText, setSearchText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = searchText.match(/^.+\.eth$/g) ? searchText : searchText + ".eth";
      }}
    >
      <InputGroup w="96">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="visit other lands"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fontWeight="bold"
        />
        <InputRightElement>
          <HStack pr="12">
            <Text fontWeight="bold">.eth</Text>
            <ArrowForwardIcon
              fontSize="xl"
              cursor="pointer"
              color="gray.600"
              onClick={() => {
                window.location.href = searchText;
              }}
            />
          </HStack>
        </InputRightElement>
      </InputGroup>
    </form>
  );
};

export default Search;
