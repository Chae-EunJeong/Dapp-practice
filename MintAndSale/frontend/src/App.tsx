import React, { FC, useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Main from "./routes/main";
import Layout from "./components/Layout";
import MyAnimal from "./routes/my-animal";
import SaleAnimal from "./routes/sale-animal";

const App: FC = () => {
  const [account, setAccount] = useState<string>("");

  const getAccount = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAccount(accounts[0]);
      } else {
        alert("Install Metamask!");
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getAccount();
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Main account={account} />} />
          <Route path="my-animal" element={<MyAnimal account={account} />} />
          <Route
            path="sale-animal"
            element={<SaleAnimal account={account} />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
