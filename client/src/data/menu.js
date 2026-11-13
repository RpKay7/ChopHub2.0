
export const menuCategories = [
  "All",
  "Nigerian Classics",
  "Breakfast & Brunch",
  "Soups & Swallow",
  "Grills & Signature Specials",
  "Sides & Small Chops",
  "Desserts",
  "Wines & Premium Drinks",
  "Cocktails & Refreshments",
];

export const menuItems = [
  // NIGERIAN CLASSICS
  {
    id: "jollof-rice",
    name: "Nigerian Party Jollof Rice",
    category: "Nigerian Classics",
    description:
      "Smoky party-style jollof rice cooked in a rich tomato and pepper blend with authentic Nigerian spices.",
    price: 4500,
    image: "/images/menu/party-jollof.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Regular", price: 4500 },
      { name: "Large", price: 6500 },
    ],
    extras: [
      { name: "Fried Plantain", price: 1000 },
      { name: "Coleslaw", price: 800 },
    ],
  },
  {
    id: "fried-rice",
    name: "Nigerian Fried Rice",
    category: "Nigerian Classics",
    description:
      "Colourful long-grain rice tossed with mixed vegetables, herbs and our signature seasoning.",
    price: 4500,
    image: "/images/menu/fried-rice.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 4500 },
      { name: "Large", price: 6500 },
    ],
    extras: [
      { name: "Fried Plantain", price: 1000 },
      { name: "Coleslaw", price: 800 },
    ],
  },
  {
    id: "ofada-rice",
    name: "Ofada Rice & Ayamase",
    category: "Nigerian Classics",
    description:
      "Locally grown Ofada rice served with rich green pepper sauce, assorted meat and traditional flavours.",
    price: 6500,
    image: "/images/menu/ofada-rice.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Regular", price: 6500 },
      { name: "Large", price: 8500 },
    ],
    extras: [
      { name: "Extra Assorted Meat", price: 2000 },
      { name: "Boiled Egg", price: 500 },
    ],
  },
  {
    id: "coconut-rice",
    name: "Creamy Coconut Rice",
    category: "Nigerian Classics",
    description:
      "Fragrant rice simmered in coconut milk with vegetables and a delicate blend of spices.",
    price: 5000,
    image: "/images/menu/coconut-rice.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 5000 },
      { name: "Large", price: 7000 },
    ],
    extras: [
      { name: "Grilled Chicken", price: 2500 },
      { name: "Fried Plantain", price: 1000 },
    ],
  },

  // BREAKFAST & BRUNCH
  {
    id: "english-breakfast",
    name: "The Classic English Breakfast",
    category: "Breakfast & Brunch",
    description:
      "Two eggs prepared to your preference, grilled sausages, crispy bacon, baked beans, sautéed mushrooms and toasted bread.",
    price: 9500,
    image: "/images/menu/english-breakfast.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Classic", price: 9500 },
      { name: "Deluxe", price: 12500 },
    ],
    extras: [
      { name: "Extra Sausage", price: 1200 },
      { name: "Extra Bacon", price: 1500 },
      { name: "Avocado", price: 1800 },
    ],
  },
  {
    id: "american-pancakes",
    name: "Fluffy American Pancakes",
    category: "Breakfast & Brunch",
    description:
      "A stack of soft, golden pancakes served with maple-style syrup, butter and fresh seasonal fruit.",
    price: 6500,
    image: "/images/menu/american-pancakes.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 6500 },
      { name: "Large", price: 8500 },
    ],
    extras: [
      { name: "Whipped Cream", price: 800 },
      { name: "Extra Fruit", price: 1200 },
    ],
  },
  {
    id: "french-toast",
    name: "French Toast Delight",
    category: "Breakfast & Brunch",
    description:
      "Thick-cut bread dipped in a lightly spiced egg mixture, golden-fried and served with syrup and fresh fruit.",
    price: 6000,
    image: "/images/menu/french-toast.jpg",
    availability: "available",
    popular: false,
    sizes: [],
    extras: [
      { name: "Extra Syrup", price: 500 },
      { name: "Vanilla Ice Cream", price: 1500 },
    ],
  },
  {
    id: "breakfast-omelette",
    name: "Garden Vegetable Omelette",
    category: "Breakfast & Brunch",
    description:
      "A fluffy three-egg omelette filled with peppers, onions, tomatoes and cheese, served with toasted bread.",
    price: 5500,
    image: "/images/menu/vegetable-omelette.jpg",
    availability: "available",
    popular: false,
    sizes: [],
    extras: [
      { name: "Extra Cheese", price: 1000 },
      { name: "Grilled Sausage", price: 1200 },
    ],
  },

  // SOUPS & SWALLOW
  {
    id: "egusi-soup",
    name: "Rich Egusi Soup",
    category: "Soups & Swallow",
    description:
      "Traditional melon seed soup prepared with leafy vegetables, assorted meat, stockfish and rich palm oil.",
    price: 5500,
    image: "/images/menu/egusi-soup.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Regular", price: 5500 },
      { name: "Large", price: 7500 },
    ],
    extras: [
      { name: "Extra Assorted Meat", price: 2000 },
      { name: "Stockfish", price: 1500 },
    ],
  },
  {
    id: "efo-riro",
    name: "Efo Riro",
    category: "Soups & Swallow",
    description:
      "A rich Yoruba spinach stew cooked with peppers, palm oil, assorted meat and traditional seasonings.",
    price: 5500,
    image: "/images/menu/efo-riro.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 5500 },
      { name: "Large", price: 7500 },
    ],
    extras: [
      { name: "Extra Meat", price: 2000 },
      { name: "Smoked Fish", price: 1500 },
    ],
  },
  {
    id: "amala-ewedu",
    name: "Amala, Ewedu & Gbegiri",
    category: "Soups & Swallow",
    description:
      "Soft amala served with smooth ewedu, creamy gbegiri and a flavourful stew with assorted meat.",
    price: 6500,
    image: "/images/menu/amala-ewedu.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Regular", price: 6500 },
      { name: "Large", price: 8500 },
    ],
    extras: [
      { name: "Extra Meat", price: 2000 },
      { name: "Extra Amala", price: 1000 },
    ],
  },
  {
    id: "pounded-yam-egusi",
    name: "Pounded Yam & Egusi",
    category: "Soups & Swallow",
    description:
      "Smooth, freshly prepared pounded yam served with rich egusi soup and assorted protein.",
    price: 7000,
    image: "/images/menu/pounded-yam-egusi.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 7000 },
      { name: "Large", price: 9000 },
    ],
    extras: [
      { name: "Extra Meat", price: 2000 },
      { name: "Extra Swallow", price: 1000 },
    ],
  },

  // GRILLS & SIGNATURE SPECIALS
  {
    id: "beef-suya",
    name: "Classic Beef Suya",
    category: "Grills & Signature Specials",
    description:
      "Tender slices of beef coated in traditional yaji spice, grilled and served with fresh onions and tomatoes.",
    price: 6500,
    image: "/images/menu/beef-suya.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Small", price: 6500 },
      { name: "Large", price: 11000 },
    ],
    extras: [
      { name: "Extra Yaji", price: 500 },
      { name: "Extra Beef", price: 2500 },
    ],
  },
  {
    id: "grilled-chicken",
    name: "Signature Grilled Chicken",
    category: "Grills & Signature Specials",
    description:
      "Juicy chicken marinated in our signature spice blend, flame-grilled and finished with a savoury glaze.",
    price: 7500,
    image: "/images/menu/grilled-chicken.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Quarter Chicken", price: 7500 },
      { name: "Half Chicken", price: 13500 },
    ],
    extras: [
      { name: "BBQ Sauce", price: 500 },
      { name: "Chips", price: 1800 },
    ],
  },
  {
    id: "peppered-turkey",
    name: "Peppered Turkey",
    category: "Grills & Signature Specials",
    description:
      "Well-seasoned turkey pieces tossed in a bold, spicy pepper sauce with onions.",
    price: 8500,
    image: "/images/menu/peppered-turkey.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 8500 },
      { name: "Large", price: 12500 },
    ],
    extras: [
      { name: "Extra Turkey", price: 3000 },
    ],
  },
  {
    id: "grilled-fish",
    name: "Whole Grilled Croaker",
    category: "Grills & Signature Specials",
    description:
      "Fresh croaker seasoned with herbs and spices, grilled and served with pepper sauce and fresh vegetables.",
    price: 14000,
    image: "/images/menu/grilled-croaker.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Medium", price: 14000 },
      { name: "Large", price: 18000 },
    ],
    extras: [
      { name: "Fried Plantain", price: 1000 },
      { name: "Extra Pepper Sauce", price: 700 },
    ],
  },

  // SIDES & SMALL CHOPS
  {
    id: "moi-moi",
    name: "Steamed Moi Moi",
    category: "Sides & Small Chops",
    description:
      "Smooth steamed bean pudding blended with peppers, onions and spices, with a soft and savoury finish.",
    price: 1800,
    image: "/images/menu/moi-moi.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Standard Wrap", price: 1800 },
      { name: "Large Wrap", price: 2800 },
    ],
    extras: [
      { name: "Boiled Egg", price: 500 },
    ],
  },
  {
    id: "plantain",
    name: "Golden Fried Plantain",
    category: "Sides & Small Chops",
    description:
      "Ripe plantain slices fried until golden, tender inside and lightly caramelised.",
    price: 1500,
    image: "/images/menu/fried-plantain.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 1500 },
      { name: "Large", price: 2500 },
    ],
    extras: [],
  },
  {
    id: "small-chops",
    name: "ChopHub Small Chops Platter",
    category: "Sides & Small Chops",
    description:
      "A satisfying selection of spring rolls, samosas, puff puff and spicy chicken bites.",
    price: 7500,
    image: "/images/menu/small-chops.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Regular", price: 7500 },
      { name: "Sharing Platter", price: 13500 },
    ],
    extras: [
      { name: "Extra Chicken Bites", price: 2500 },
    ],
  },

  // DESSERTS
  {
    id: "chocolate-cake",
    name: "Chocolate Fudge Cake",
    category: "Desserts",
    description:
      "Rich chocolate sponge layered with smooth chocolate frosting and finished with chocolate drizzle.",
    price: 4500,
    image: "/images/menu/chocolate-cake.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Single Slice", price: 4500 },
      { name: "Double Slice", price: 7500 },
    ],
    extras: [
      { name: "Vanilla Ice Cream", price: 1500 },
    ],
  },
  {
    id: "cheesecake",
    name: "New York Cheesecake",
    category: "Desserts",
    description:
      "Creamy baked cheesecake on a buttery biscuit base, served chilled.",
    price: 5000,
    image: "/images/menu/cheesecake.jpg",
    availability: "available",
    popular: false,
    sizes: [],
    extras: [
      { name: "Berry Sauce", price: 700 },
    ],
  },

  // WINES & PREMIUM DRINKS
  {
    id: "red-wine",
    name: "Premium Red Wine",
    category: "Wines & Premium Drinks",
    description:
      "A smooth red wine with rich fruit notes, suitable for pairing with grilled dishes and hearty meals.",
    price: 12000,
    image: "/images/menu/red-wine.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Glass", price: 12000 },
      { name: "Bottle", price: 45000 },
    ],
    extras: [],
  },
  {
    id: "white-wine",
    name: "Premium White Wine",
    category: "Wines & Premium Drinks",
    description:
      "A refreshing white wine with crisp fruit character, ideal with grilled fish and lighter meals.",
    price: 12000,
    image: "/images/menu/white-wine.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Glass", price: 12000 },
      { name: "Bottle", price: 45000 },
    ],
    extras: [],
  },
  {
    id: "sparkling-wine",
    name: "Sparkling Wine",
    category: "Wines & Premium Drinks",
    description:
      "A chilled sparkling wine with lively bubbles, suitable for celebrations and special occasions.",
    price: 18000,
    image: "/images/menu/sparkling-wine.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Glass", price: 18000 },
      { name: "Bottle", price: 65000 },
    ],
    extras: [],
  },

  // COCKTAILS & REFRESHMENTS
  {
    id: "chapman",
    name: "Classic Chapman",
    category: "Cocktails & Refreshments",
    description:
      "A refreshing Nigerian-style blend of fruity flavours, citrus and sparkling soda, served chilled.",
    price: 3000,
    image: "/images/menu/chapman.jpg",
    availability: "available",
    popular: true,
    sizes: [
      { name: "Regular", price: 3000 },
      { name: "Large", price: 4500 },
    ],
    extras: [],
  },
  {
    id: "mojito",
    name: "Classic Mojito",
    category: "Cocktails & Refreshments",
    description:
      "A refreshing cocktail made with mint, lime, sugar and soda, served over ice.",
    price: 6500,
    image: "/images/menu/mojito.jpg",
    availability: "available",
    popular: false,
    sizes: [],
    extras: [],
  },
  {
    id: "zobo",
    name: "Chilled Zobo",
    category: "Cocktails & Refreshments",
    description:
      "A chilled hibiscus drink infused with natural spices and a refreshing fruity finish.",
    price: 1800,
    image: "/images/menu/zobo.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 1800 },
      { name: "Large", price: 2800 },
    ],
    extras: [],
  },
  {
    id: "fresh-orange-juice",
    name: "Fresh Orange Juice",
    category: "Cocktails & Refreshments",
    description:
      "Freshly squeezed orange juice served chilled.",
    price: 3000,
    image: "/images/menu/orange-juice.jpg",
    availability: "available",
    popular: false,
    sizes: [
      { name: "Regular", price: 3000 },
      { name: "Large", price: 4500 },
    ],
    extras: [],
  },
];
