import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ChainVote',
  projectId: 'c4fc91a4c80b47d7bf5f754f5be7969b', // Replace with your WalletConnect Project ID from https://cloud.walletconnect.com
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
});
