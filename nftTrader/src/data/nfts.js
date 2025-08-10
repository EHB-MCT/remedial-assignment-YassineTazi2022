export const sampleNfts = [
  { id: '1', name: 'CryptoCat #1', basePrice: 120.0 },
  { id: '2', name: 'PixelPunk #42', basePrice: 280.5 },
  { id: '3', name: 'Abstract Ape #7', basePrice: 75.25 },
];

export function getNftById(id) {
  return sampleNfts.find((n) => n.id === String(id));
}
