import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

import Index from "./pages/Index";
import VoteDetail from "./pages/VoteDetail";
import CreateVote from "./pages/CreateVote";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: 'hsl(177, 100%, 50%)',
            accentColorForeground: 'hsl(200, 30%, 5%)',
            borderRadius: 'medium',
          })}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/vote/:id" element={<VoteDetail />} />
              <Route path="/create" element={<CreateVote />} />
              <Route path="/about" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </RainbowKitProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
