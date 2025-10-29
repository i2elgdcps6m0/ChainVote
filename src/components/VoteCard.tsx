import { Clock, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface VoteCardProps {
  id: string;
  title: string;
  description: string;
  status: "active" | "ended";
  endTime: string;
  totalVotes: number;
  options: string[];
}

export const VoteCard = ({
  id,
  title,
  description,
  status,
  endTime,
  totalVotes,
  options,
}: VoteCardProps) => {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 hover:glow-card bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold line-clamp-1">{title}</h3>
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Active" : "Ended"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Ends: {endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{totalVotes} votes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{options.length} options</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link to={`/vote/${id}`} className="w-full">
          <Button variant={status === "active" ? "default" : "secondary"} className="w-full">
            {status === "active" ? "Vote Now" : "View Results"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
