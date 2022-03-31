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
import MetaSoil from "~/public/meta_objects/soil.png";
import MetaOil from "~/public/meta_objects/oil.png";
import MetaSeed from "~/public/meta_objects/seed.png";
import MetaIron from "~/public/meta_objects/iron.png";
import MetaBrick from "~/public/meta_objects/brick.png";
import MetaBrickHouse from "~/public/meta_objects/brickhouse.png";
import MetaPla from "~/public/meta_objects/pla.png";
import MetaSteel from "~/public/meta_objects/steel.png";
import MetaComputer from "~/public/meta_objects/computer.png";
import MetaDenki from "~/public/meta_objects/denki.png";
import { MaterialID, ObjectID } from "~/types";

export const ObjectImages: { [key in ObjectID]: StaticImageData } = {
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
  13: MetaBrick,
  14: MetaBrickHouse,
  15: null,
  16: null,
  17: MetaPla,
  18: MetaSteel,
  19: MetaComputer,
  20: MetaDenki,
};

export const MaterialImages: { [key in MaterialID]: StaticImageData } = {
  1: Soil,
};

export const MetaPrimitiveMaterialImages: { [key in MaterialID]: StaticImageData } = {
  1: MetaSoil,
  2: MetaOil,
  3: MetaSeed,
  4: MetaIron,
};
