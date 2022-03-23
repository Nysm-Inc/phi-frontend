import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { StarknetProvider } from "@starknet-react/core";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Layout } from "~/components/layout";
import { GoogleAnalytics, usePageView } from "~/components/analytics/GA";
import AppContextProvider from "~/contexts";
import theme from "~/styles";

const App = ({ Component, pageProps }: AppProps) => {
  usePageView();
  return (
    <>
      <GoogleAnalytics />

      <StarknetProvider>
        <ChakraProvider theme={theme}>
          <DndProvider backend={HTML5Backend}>
            <AppContextProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </AppContextProvider>
          </DndProvider>
        </ChakraProvider>
      </StarknetProvider>
    </>
  );
};

export default App;
