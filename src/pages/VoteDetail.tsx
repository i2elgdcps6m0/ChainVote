import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProposalInfo, useProposalResults, useHasVoted } from "@/hooks/useChainVote";
import { useWriteContract } from "wagmi";
import { CONTRACTS, ABIS } from "@/config/contracts";
import { encryptVote, initializeFHE } from "@/lib/fhe";

const VoteDetail = () => {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const proposalId = id ? BigInt(id) : undefined;

  const { proposalInfo, isLoading: isLoadingInfo, refetch: refetchInfo } = useProposalInfo(proposalId);
  const { results, refetch: refetchResults } = useProposalResults(proposalId);
  const { hasVoted, refetch: refetchHasVoted } = useHasVoted(proposalId, address);

  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isVoting, setIsVoting] = useState(false);
  const [isRequestingDecryption, setIsRequestingDecryption] = useState(false);

  useEffect(() => {
    if (proposalId !== undefined) {
      refetchInfo();
      refetchResults();
      if (address) {
        refetchHasVoted();
      }
    }
  }, [proposalId, address, refetchInfo, refetchResults, refetchHasVoted]);

  if (isLoadingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
        <Header />
        <main className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading proposal...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!proposalInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
        <Header />
        <main className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl font-bold mb-4">Proposal Not Found</h1>
            <Link to="/">
              <Button>Back to Proposals</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const [name, details, choices, votingStart, votingEnd, resultsPublished, proposer, voterCount] = proposalInfo;

  const now = Math.floor(Date.now() / 1000);
  const startTime = Number(votingStart);
  const endTime = Number(votingEnd);

  const status =
    now < startTime ? "pending" : now >= startTime && now < endTime ? "active" : "ended";

  const handleVote = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!selectedOption) {
      toast.error("Please select an option");
      return;
    }

    if (hasVoted) {
      toast.error("You have already voted on this proposal");
      return;
    }

    setIsVoting(true);

    try {
      await initializeFHE();

      const choiceId = BigInt(selectedOption);

      // Encrypt vote value of 1
      const { encryptedVote: encVote, proof } = await encryptVote(
        1n,
        CONTRACTS.ChainVote,
        address!
      );

      const hash = await writeContractAsync({
        address: CONTRACTS.ChainVote,
        abi: ABIS.ChainVote,
        functionName: "castVote",
        args: [proposalId!, choiceId, encVote, proof],
      });

      toast.success("Vote encrypted and submitted successfully!");
      console.log("Transaction hash:", hash);

      // Refetch hasVoted status
      setTimeout(() => {
        refetchHasVoted();
      }, 2000);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error(error.message || "Failed to cast vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleRequestDecryption = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsRequestingDecryption(true);

    try {
      const hash = await writeContractAsync({
        address: CONTRACTS.ChainVote,
        abi: ABIS.ChainVote,
        functionName: "requestResultsDecryption",
        args: [proposalId!],
      });

      toast.success("Decryption requested! Results will be available soon.");
      console.log("Transaction hash:", hash);

      // Poll for results
      const pollInterval = setInterval(() => {
        refetchResults();
        refetchInfo();
      }, 3000);

      // Stop polling after 60 seconds
      setTimeout(() => clearInterval(pollInterval), 60000);
    } catch (error: any) {
      console.error("Error requesting decryption:", error);
      toast.error(error.message || "Failed to request decryption");
    } finally {
      setIsRequestingDecryption(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Header />

      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to votes
          </Link>

          {/* Vote header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold">{name}</h1>
              <Badge
                variant={
                  status === "active"
                    ? "default"
                    : status === "pending"
                    ? "secondary"
                    : "outline"
                }
              >
                {status === "active" ? "Active" : status === "pending" ? "Pending" : "Ended"}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{details}</p>
          </div>

          {/* Vote stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {status === "pending" ? "Starts" : "Ends"}
                    </p>
                    <p className="font-semibold">
                      {new Date(
                        (status === "pending" ? startTime : endTime) * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                    <p className="font-semibold">{Number(voterCount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voting section */}
          {status === "active" && !hasVoted && (
            <Card className="mb-8 glow-card bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-bold">Cast Your Vote</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your vote will be encrypted using FHE technology
                </p>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="space-y-3">
                    {choices.map((choice, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`choice-${index}`}
                          disabled={isVoting}
                        />
                        <Label
                          htmlFor={`choice-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {choice}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <Button
                  onClick={handleVote}
                  className="w-full mt-6 glow-border"
                  size="lg"
                  disabled={isVoting || !isConnected || !selectedOption}
                >
                  {isVoting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Encrypting & Submitting Vote...
                    </>
                  ) : !isConnected ? (
                    "Connect Wallet to Vote"
                  ) : (
                    "Submit Encrypted Vote"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Already voted message */}
          {hasVoted && status === "active" && (
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-center">
                ✓ Your vote has been encrypted and recorded on-chain
              </p>
            </div>
          )}

          {/* Results section */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {resultsPublished ? "Final Results" : "Results (Encrypted)"}
                  </h2>
                  {!resultsPublished && (
                    <p className="text-sm text-muted-foreground">
                      {status === "active"
                        ? "Results are encrypted until voting ends"
                        : "Results need to be decrypted"}
                    </p>
                  )}
                </div>
                {status === "ended" && !resultsPublished && (
                  <Button
                    onClick={handleRequestDecryption}
                    disabled={isRequestingDecryption}
                    variant="outline"
                  >
                    {isRequestingDecryption ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      "Request Decryption"
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {resultsPublished && results ? (
                <div className="space-y-6">
                  {choices.map((choice, index) => {
                    const votes = Number(results[index] || 0);
                    const totalVotes = Number(voterCount);
                    const percentage =
                      totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{choice}</span>
                          <span className="text-muted-foreground">
                            {votes} votes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Results are encrypted and will be revealed after voting ends</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VoteDetail;
