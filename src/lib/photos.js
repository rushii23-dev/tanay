// Real photographs from Unsplash (free to use under the Unsplash License), served from the Unsplash image CDN.
// Each entry keeps the photographer's Unsplash handle for the credits on the Data sources page.

export const PHOTOS = {
  ploughing: { id: 'photo-1620901433789-1d2f85a93653', by: 'saikirankesari', alt: 'A farmer ploughing a field with two white oxen under a stormy evening sky' },
  transplanting: { id: 'photo-1633410195091-bd66114cef5f', by: 'jagu10', alt: 'A line of farmers transplanting rice seedlings in a flooded field below green hills' },
  palms: { id: 'photo-1694011772133-dc4b3ff3f24f', by: 'chrysanthemum_', alt: 'A man walking through a rice field lined with coconut palms' },
  harvesting: { id: 'photo-1530507629858-e4977d30e9e0', by: 'nandhukumarndd', alt: 'A woman harvesting rice by hand' },
  standing: { id: 'photo-1528693404014-b13ebe6e723e', by: 'nandhukumarndd', alt: 'A farmer standing in a young rice field' },
  seedlings: { id: 'photo-1542911882-c7100ccf771b', by: 'fotomurthy', alt: 'Bundles of rice seedlings in a flooded paddy' },
  greenField: { id: 'photo-1716650205028-af3e1b453c3a', by: 'jsensarma', alt: 'A wide green paddy field with trees on the horizon' },
  lushField: { id: 'photo-1698150098242-cc61d0df20eb', by: 'vizagexplore', alt: 'A lush green field with trees in the background' },
  wheatSky: { id: 'photo-1437252611977-07f74518abd7', by: 'melissaaskew', alt: 'Ripe wheat ears against a deep blue sky' },
  wheatGold: { id: 'photo-1529511582893-2d7e684dd128', by: 'polina_art', alt: 'A golden wheat field under a blue sky' },
  wheatSunset: { id: 'photo-1594842059196-5b6b8fa73187', by: 'vlad_stawizki', alt: 'A wheat ear lit by the setting sun' },
  cropRows: { id: 'photo-1560493676-04071c5f467b', by: 'dmey503', alt: 'Long rows of green crops at sunset' },
  tractor: { id: 'photo-1574943320219-553eb213f72d', by: 'rajesh_ram', alt: 'A farmer on a tractor beside oxen in a green field' },
  farmerField: { id: 'photo-1615829254885-d4bfd5ce700e', by: 'vivek93', alt: 'A farmer standing in a misty green field' },
  soilHands: { id: 'photo-1492496913980-501348b61469', by: 'gabrielj_photography', alt: 'Cupped hands holding dark soil' },
  soilClose: { id: 'photo-1642952273588-ed6fa28870ac', by: 'allysphotos', alt: 'A handful of dark, crumbly soil' },
  monsoon: { id: 'photo-1784751449592-43f09159b621', by: 'ratna7674', alt: 'Rain falling over green rice paddies with hills behind' },
  rainPlanting: { id: 'photo-1793548850230-d845488abadd', by: 'biscuits22123', alt: 'Farmers in rain ponchos planting rice in the rain' },
  leafSpots: { id: 'photo-1692481061201-5767c19396af', by: 'eprouzet', alt: 'Green leaves covered in yellow disease spots' },
  leafYellow: { id: 'photo-1692481060581-98c224124f12', by: 'eprouzet', alt: 'A leaf with yellow and brown disease patches' },
  teaHills: { id: 'photo-1491497895121-1334fc14d8c9', by: 'qriusv', alt: 'Misty tea gardens on rolling hills' },
  women: { id: 'photo-1707721690544-781fe6ede937', by: 'equalstock', alt: 'A group of women farmers standing together in a field' },
  womenWork: { id: 'photo-1707721690626-10e5f0366bcb', by: 'equalstock', alt: 'Women farmers working in a vegetable field' },
  smile: { id: 'photo-1623211265502-412854043d15', by: 'mp_gokul', alt: 'A smiling farmer holding a green plant' },
  teaLeaves: { id: 'photo-1579765875481-1bc20e5a4a49', by: 'iamnithin', alt: 'Fresh green leaves with water droplets' },
};

export const photoUrl = (key, w = 1600) => `https://images.unsplash.com/${PHOTOS[key].id}?w=${w}&q=72&auto=format&fit=crop`;
export const srcSet = (key) => [640, 1080, 1600, 2200].map((w) => `${photoUrl(key, w)} ${w}w`).join(', ');
