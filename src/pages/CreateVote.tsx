import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useChainVote } from "@/hooks/useChainVote";
import { formatEther } from "viem";

const CreateVote = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { createProposal, proposalFee } = useChainVote();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isCreating, setIsCreating] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      toast.error("Maximum 10 options allowed");
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    // Validation
    if (!title || !description || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const filledOptions = options.filter(opt => opt.trim() !== "");
    if (filledOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    if (filledOptions.length > 10) {
      toast.error("Maximum 10 options allowed");
      return;
    }

    // Convert dates to timestamps
    const votingStart = BigInt(Math.floor(new Date(startDate).getTime() / 1000));
    const votingEnd = BigInt(Math.floor(new Date(endDate).getTime() / 1000));
    const now = BigInt(Math.floor(Date.now() / 1000));

    if (votingEnd <= votingStart) {
      toast.error("End date must be after start date");
      return;
    }

    if (votingEnd <= now) {
      toast.error("End date must be in the future");
      return;
    }

    setIsCreating(true);

    try {
      const hash = await createProposal(
        title,
        description,
        filledOptions,
        votingStart,
        votingEnd
      );

      toast.success("Proposal created successfully with FHE encryption!");
      console.log("Transaction hash:", hash);

      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      console.error("Error creating proposal:", error);
      toast.error(error.message || "Failed to create proposal");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Create New Vote</h1>
            <p className="text-lg text-muted-foreground">
              Set up a new encrypted voting proposal
            </p>
          </div>

          <Card className="glow-card bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold">Vote Details</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Protocol Upgrade Proposal"
                    className="mt-2"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this vote is about..."
                    className="mt-2 min-h-[120px]"
                    required
                  />
                </div>

                {/* Start Date */}
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2"
                    required
                    disabled={isCreating}
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2"
                    required
                    disabled={isCreating}
                  />
                </div>

                {/* Options */}
                <div>
                  <Label>Voting Options *</Label>
                  <div className="space-y-3 mt-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addOption}
                    className="mt-3 w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                {/* Fee notice */}
                {proposalFee && (
                  <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
                    <p className="text-sm">
                      💰 Proposal Fee: <span className="font-semibold">{formatEther(proposalFee)} ETH</span>
                    </p>
                  </div>
                )}

                {/* Privacy notice */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm">
                    🔒 All votes will be encrypted using FHE technology and remain private until the voting period ends.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full glow-border"
                  size="lg"
                  disabled={isCreating || !isConnected}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Proposal...
                    </>
                  ) : !isConnected ? (
                    "Connect Wallet to Create"
                  ) : (
                    "Create Encrypted Vote"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateVote;
