import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Lock, Eye, Code, Zap, Globe } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "FHE Technology",
      description: "Fully Homomorphic Encryption allows computations on encrypted data without decryption",
    },
    {
      icon: Lock,
      title: "End-to-End Privacy",
      description: "Vote data remains encrypted throughout the entire process until final reveal",
    },
    {
      icon: Eye,
      title: "Trusted Callbacks",
      description: "Results are only disclosed through secure, verified callback mechanisms",
    },
    {
      icon: Code,
      title: "On-Chain Verification",
      description: "All votes are recorded on blockchain for transparency and immutability",
    },
    {
      icon: Zap,
      title: "Efficient Processing",
      description: "Optimized FHE operations ensure fast vote counting without compromising security",
    },
    {
      icon: Globe,
      title: "Decentralized",
      description: "No central authority can access or manipulate individual votes",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Hero section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent glow-text">
                About ChainVote
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The first fully private on-chain voting platform powered by Fully Homomorphic Encryption (FHE)
            </p>
          </div>

          {/* What is FHE */}
          <Card className="mb-12 glow-card bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-3xl font-bold">What is FHE?</h2>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Fully Homomorphic Encryption (FHE) is a revolutionary cryptographic technology that allows computations 
                to be performed on encrypted data without ever decrypting it. This means votes can be counted, aggregated, 
                and verified while remaining completely encrypted.
              </p>
              <p>
                Traditional voting systems require decrypting votes to count them, creating privacy vulnerabilities. 
                With FHE, ChainVote maintains complete privacy throughout the entire voting lifecycle - from submission 
                to tallying to verification.
              </p>
            </CardContent>
          </Card>

          {/* Features grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:border-primary/50 transition-all duration-300 hover:glow-card bg-card/80 backdrop-blur-sm"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How it works */}
          <Card className="glow-card bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-3xl font-bold">How It Works</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Create Vote</h3>
                  <p className="text-muted-foreground">
                    Anyone can create a voting proposal with custom options and end time
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Encrypted Voting</h3>
                  <p className="text-muted-foreground">
                    Voters submit their choices, which are immediately encrypted using FHE
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Private Counting</h3>
                  <p className="text-muted-foreground">
                    Votes are tallied while encrypted - no one can see individual votes
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Trusted Reveal</h3>
                  <p className="text-muted-foreground">
                    After voting ends, final results are revealed through a secure callback mechanism
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 ChainVote. Powered by FHE technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
