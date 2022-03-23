import axios from "axios";
import { FC, createContext, useState, useEffect } from "react";
import { hooks } from "~/connectors/metamask";
import { currentENSKey, ENS_GRAPH_ENDPOINT_GOERLI } from "~/constants";
import { Domain } from "~/types";

type AppContext = {
  account: string;
  starknetAccount: string;
  currentENS: string;
  ownedDomains: string[];
  isEdit: boolean;
  isCreatedPhiland: boolean;
  handleStarknetAccount: (starknetAccount: string) => void;
  handleCreatePhiland: (isCreatedPhiland: boolean) => void;
  handleEdit: (isEdit: boolean) => void;
  refleshOwnedDomains: () => void;
};

export const AppContext = createContext<AppContext>(undefined);

const { useAccounts, useProvider, useENSNames } = hooks;

const getOwnedEnsDomains = async (account: string): Promise<Domain[]> => {
  const query = `
      {
        account(id: "${account.toLowerCase()}") {
          domains {
            id
            name
            labelName
            labelhash
          }
        }
      }
    `;
  const res = await axios.post<{ data: { account?: { domains: Domain[] } } }>(ENS_GRAPH_ENDPOINT_GOERLI, { query });
  return res.data.data.account?.domains || [];
};

const AppContextProvider: FC = ({ children }) => {
  const accounts = useAccounts();
  const account = accounts ? accounts[0] : "";
  const provider = useProvider();
  const ensList = useENSNames(provider);
  const ens = ensList ? ensList[0] || "" : "";
  const [starknetAccount, setStarknetAccount] = useState("");

  const [currentENS, setCurrentENS] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isCreatedPhiland, setIsCreatedPhiland] = useState(false);
  const [refleshOwnedDomains, setRefleshOwnedDomains] = useState(false);

  const handleEdit = (isEdit: boolean): void => setIsEdit(isEdit);
  const handleCreatePhiland = (isCreatedPhiland: boolean) => setIsCreatedPhiland(isCreatedPhiland);
  const handleStarknetAccount = (starknetAccount: string) => setStarknetAccount(starknetAccount);

  useEffect(() => {
    if (!account) return;

    (async () => {
      const ownedDomains = await getOwnedEnsDomains(account);
      setDomains(ownedDomains.map((domain) => domain.name));
    })();
  }, [account, refleshOwnedDomains]);

  useEffect(() => {
    const cached = localStorage.getItem(currentENSKey) || "";
    if (domains.includes(cached)) {
      setCurrentENS(cached);
    } else if (ens) {
      setCurrentENS(ens);
    } else {
      setCurrentENS("");
    }
  }, [ens, domains]);

  return (
    <AppContext.Provider
      value={{
        account: account,
        starknetAccount,
        currentENS: currentENS,
        ownedDomains: domains,
        isCreatedPhiland: isCreatedPhiland,
        isEdit: isEdit,
        handleStarknetAccount,
        handleCreatePhiland: handleCreatePhiland,
        handleEdit: handleEdit,
        refleshOwnedDomains: () => setRefleshOwnedDomains((old) => !old),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
