import { Shield, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  const features = [
    {
      icon: Shield,
      title: "FHE Encryption",
      description: "Fully Homomorphic Encryption keeps votes encrypted during counting",
    },
    {
      icon: Lock,
      title: "Complete Privacy",
      description: "Vote data remains encrypted until final results are revealed",
    },
    {
      icon: Eye,
      title: "Trusted Callback",
      description: "Results only disclosed through secure callback mechanism",
    },
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main heading */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent glow-text">
                Private On-Chain Voting
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Powered by FHE technology, ChainVote ensures complete privacy throughout the entire voting process
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link to="/create">
              <Button variant="default" size="lg" className="glow-border">
                Create Vote
              </Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" size="lg">
                Explore Votes
              </Button>
            </Link>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-lg bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:glow-card"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
