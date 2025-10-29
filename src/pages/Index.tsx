import { useState, useEffect } from "react";
import { useReadContract, usePublicClient } from "wagmi";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { VoteCard } from "@/components/VoteCard";
import { Loader2 } from "lucide-react";
import { CONTRACTS, ABIS } from "@/config/contracts";

interface ProposalData {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "ended";
  endTime: string;
  totalVotes: number;
  options: string[];
}

const Index = () => {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  // Get proposal count
  const { data: proposalCount } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "getProposalCount",
  });

  useEffect(() => {
    const fetchProposals = async () => {
      if (!proposalCount || Number(proposalCount) === 0 || !publicClient) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const count = Number(proposalCount);
        const fetchedProposals: ProposalData[] = [];

        // Fetch all proposals info from contract
        for (let i = 0; i < count; i++) {
          try {
            const result = await publicClient.readContract({
              address: CONTRACTS.ChainVote,
              abi: ABIS.ChainVote,
              functionName: "getProposalInfo",
              args: [BigInt(i)],
            });

            if (result) {
              const [name, details, choices, votingStart, votingEnd, resultsPublished, proposer, voterCount] = result;

              const now = Math.floor(Date.now() / 1000);
              const startTime = Number(votingStart);
              const endTime = Number(votingEnd);

              let status: "pending" | "active" | "ended";
              if (now < startTime) {
                status = "pending";
              } else if (now >= startTime && now < endTime) {
                status = "active";
              } else {
                status = "ended";
              }

              fetchedProposals.push({
                id: i.toString(),
                title: name,
                description: details,
                status,
                endTime: new Date(endTime * 1000).toLocaleString(),
                totalVotes: Number(voterCount),
                options: choices,
              });
            }
          } catch (error) {
            console.error(`Error fetching proposal ${i}:`, error);
          }
        }

        setProposals(fetchedProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [proposalCount, publicClient]);

  const activeVotes = proposals.filter((v) => v.status === "active");
  const pendingVotes = proposals.filter((v) => v.status === "pending");
  const endedVotes = proposals.filter((v) => v.status === "ended");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Header />

      <main className="pt-16">
        <Hero />

        {/* Active Votes Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Active Votes</h2>
              <p className="text-muted-foreground">
                Participate in ongoing governance decisions
                {proposalCount !== undefined && ` (${Number(proposalCount)} total proposals)`}
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading proposals from blockchain...</p>
              </div>
            ) : activeVotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeVotes.map((vote) => (
                  <VoteCard key={vote.id} {...vote} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No active proposals yet. Be the first to create one!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pending Votes Section */}
        {pendingVotes.length > 0 && (
          <section className="py-16 px-6 bg-muted/30">
            <div className="container mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Upcoming Votes</h2>
                <p className="text-muted-foreground">Proposals starting soon</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingVotes.map((vote) => (
                  <VoteCard key={vote.id} {...vote} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ended Votes Section */}
        {endedVotes.length > 0 && (
          <section className="py-16 px-6 bg-card/30">
            <div className="container mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Ended Votes</h2>
                <p className="text-muted-foreground">Review past voting results</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedVotes.map((vote) => (
                  <VoteCard key={vote.id} {...vote} />
                ))}
              </div>
            </div>
          </section>
        )}
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

export default Index;
