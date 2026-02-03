import barbel from '../../assets/gifts/barbel.png';
import brushes from '../../assets/gifts/brushes.png';
import bunny from '../../assets/gifts/bunny.png';
import candles from '../../assets/gifts/candles.png';
import chocolate from '../../assets/gifts/chocolate.png';
import cup from '../../assets/gifts/cup.png';
import flowers from '../../assets/gifts/flowers.png';
import headphones from '../../assets/gifts/headphones.png';
import heart from '../../assets/gifts/heart.png';
import helmet from '../../assets/gifts/helmet.png';
import lipstic from '../../assets/gifts/lipstic.png';
import necklace from '../../assets/gifts/necklace.png';
import parfumes from '../../assets/gifts/parfumes.png';
import ring from '../../assets/gifts/ring.png';
import rose from '../../assets/gifts/rose.png';
import shoe from '../../assets/gifts/shoe.png';
import strawberries from '../../assets/gifts/strawberries.png';
import sunglasses from '../../assets/gifts/sunglasses.png';
import sweets from '../../assets/gifts/sweets.png';

export interface Gift {
  name: string;
  price: number;
  stars: number;
  jumps: number;
  fuel: number;
  emoji: string;
  id: number;
  label: string;
  image: string;
  userHave: boolean;
}

// Gift data with images
export const giftData: Gift[] = [
  {
    name: 'Heart Ring',
    price: 60.99,
    stars: 2500,
    jumps: 14500000,
    fuel: 2500,
    emoji: '💍',
    id: 1,
    label: 'Heart Ring',
    image: ring,
    userHave: false,
  },
  {
    name: 'Pink Motorcycle Helmet',
    price: 36.49,
    stars: 1500,
    jumps: 11600000,
    fuel: 2000,
    emoji: '🏍️',
    id: 2,
    label: 'Pink Motorcycle Helmet',
    image: helmet,
    userHave: false,
  },
  {
    name: 'Heart Bracelet',
    price: 23.99,
    stars: 1000,
    jumps: 8700000,
    fuel: 1500,
    emoji: '🔗',
    id: 3,
    label: 'Heart Bracelet',
    image: heart,
    userHave: false,
  },
  {
    name: 'Heart Perfume Bottle',
    price: 23.99,
    stars: 1000,
    jumps: 8700000,
    fuel: 1500,
    emoji: '🌸',
    id: 4,
    label: 'Heart Perfume Bottle',
    image: parfumes,
    userHave: false,
  },
  {
    name: 'Pink Fluffy Headphones',
    price: 23.99,
    stars: 1000,
    jumps: 7300000,
    fuel: 1250,
    emoji: '🎧',
    id: 5,
    label: 'Pink Fluffy Headphones',
    image: headphones,
    userHave: false,
  },
  {
    name: 'Pink Heel',
    price: 17.99,
    stars: 750,
    jumps: 5800000,
    fuel: 1000,
    emoji: '👠',
    id: 6,
    label: 'Pink Heel',
    image: shoe,
    userHave: false,
  },
  {
    name: 'Bunny Plush Toy',
    price: 17.99,
    stars: 750,
    jumps: 5800000,
    fuel: 1000,
    emoji: '🐰',
    id: 7,
    label: 'Bunny Plush Toy',
    image: bunny,
    userHave: false,
  },
  {
    name: 'Gold Dumbbell',
    price: 17.99,
    stars: 750,
    jumps: 4400000,
    fuel: 750,
    emoji: '🏋️',
    id: 8,
    label: 'Gold Dumbbell',
    image: barbel,
    userHave: false,
  },
  {
    name: 'Makeup Brushes Set',
    price: 17.99,
    stars: 750,
    jumps: 4400000,
    fuel: 750,
    emoji: '💄',
    id: 9,
    label: 'Makeup Brushes Set',
    image: brushes,
    userHave: false,
  },
  {
    name: 'Black Sunglasses',
    price: 11.99,
    stars: 500,
    jumps: 3500000,
    fuel: 500,
    emoji: '🕶️',
    id: 10,
    label: 'Black Sunglasses',
    image: sunglasses,
    userHave: false,
  },
  {
    name: 'Heart-shaped Chocolates',
    price: 11.99,
    stars: 500,
    jumps: 3500000,
    fuel: 500,
    emoji: '🍫',
    id: 11,
    label: 'Heart-shaped Chocolates',
    image: chocolate,
    userHave: false,
  },
  {
    name: 'Candles',
    price: 8.49,
    stars: 350,
    jumps: 2900000,
    fuel: 500,
    emoji: '🕯️',
    id: 12,
    label: 'Candles',
    image: candles,
    userHave: false,
  },
  {
    name: 'Red Lipstick',
    price: 8.49,
    stars: 350,
    jumps: 2900000,
    fuel: 500,
    emoji: '💋',
    id: 13,
    label: 'Red Lipstick',
    image: lipstic,
    userHave: false,
  },
  {
    name: 'Basket of Strawberries',
    price: 8.49,
    stars: 350,
    jumps: 2900000,
    fuel: 500,
    emoji: '🍓',
    id: 14,
    label: 'Basket of Strawberries',
    image: strawberries,
    userHave: false,
  },
  {
    name: 'Marble Mug',
    price: 8.49,
    stars: 350,
    jumps: 2600000,
    fuel: 400,
    emoji: '☕',
    id: 15,
    label: 'Marble Mug',
    image: cup,
    userHave: false,
  },
  {
    name: 'Heart Keychain',
    price: 8.49,
    stars: 350,
    jumps: 2300000,
    fuel: 350,
    emoji: '🔑',
    id: 16,
    label: 'Heart Keychain',
    image: necklace,
    userHave: false,
  },
  {
    name: 'Peony Flower',
    price: 8.49,
    stars: 350,
    jumps: 2300000,
    fuel: 350,
    emoji: '🌺',
    id: 17,
    label: 'Peony Flower',
    image: flowers,
    userHave: false,
  },
  {
    name: 'Red Rose',
    price: 6.09,
    stars: 250,
    jumps: 1500000,
    fuel: 250,
    emoji: '🌹',
    id: 18,
    label: 'Red Rose',
    image: rose,
    userHave: false,
  },
  {
    name: 'Heart-shaped Candy Bag',
    price: 6.09,
    stars: 250,
    jumps: 1500000,
    fuel: 250,
    emoji: '🍬',
    id: 19,
    label: 'Heart-shaped Candy Bag',
    image: sweets,
    userHave: false,
  },
];
