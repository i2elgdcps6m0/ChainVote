import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ChainVote',
  projectId: 'c4fc91a4c80b47d7bf5f754f5be7969b',
  chains: [sepolia],
  ssr: false,
});
