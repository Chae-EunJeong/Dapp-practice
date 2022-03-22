import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
} from "@chakra-ui/react";
import React, { FC, useState, ChangeEvent } from "react";
import {
  saleAnimalTokenAddress,
  saleAnimalTokenContract,
  web3,
} from "../contracts";
import AnimalCard from "./AnimalCard";

export interface IMyAnimalCard {
  animalTokenId: string;
  animalType: string;
  animalPrice: string;
}

interface MyAnimalCardProps extends IMyAnimalCard {
  saleStatus: boolean;
  account: string;
}

const MyAnimalCard: FC<MyAnimalCardProps> = ({
  animalTokenId,
  animalType,
  animalPrice,
  saleStatus,
  account,
}) => {
  const [sellPrice, setSellPrice] = useState<string>("");
  const [myAnimalPrice, setMyAnimalPrice] = useState<string>(animalPrice);

  const onChangeSellPrice = (e: ChangeEvent<HTMLInputElement>) => {
    setSellPrice(e.target.value);
  };

  const onClickSell = async () => {
    try {
      if (!account || !saleStatus) return;
      const response = await saleAnimalTokenContract.methods
        .setForSaleAnimalToken(
          animalTokenId,
          web3.utils.toWei(sellPrice, "ether")
        )
        .send({ from: account });

      if (response.status) {
        setMyAnimalPrice(web3.utils.toWei(sellPrice, "ether"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box textAlign="center" w={150}>
      <AnimalCard animalType={animalType} />
      <Box mt={2}>
        {myAnimalPrice === "0" ? (
          <>
            <InputGroup>
              <Input
                type="number"
                value={sellPrice}
                onChange={onChangeSellPrice}
              />
              <InputRightAddon children="Matic" />
            </InputGroup>
            <Button size="sm" colorScheme="green" mt={2} onClick={onClickSell}>
              Sell
            </Button>
          </>
        ) : (
          <Text d="inline-block">
            {web3.utils.fromWei(myAnimalPrice)} Matic
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default MyAnimalCard;
