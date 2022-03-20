import React, { FC } from "react";
import { Image } from "@chakra-ui/react";

interface AnimalCardProps {
  animalType: string;
}

const AnimalCard: FC<AnimalCardProps> = ({ animalType }) => {
  return (
    <Image src={`images/${animalType}.png`} alt="AnimalCard" w={150} h={150} />
  );
};

export default AnimalCard;
