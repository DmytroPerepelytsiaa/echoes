"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { decisionInputSchema, type DecisionInput } from "@/lib/validations";
import { useCreateDecision } from "@/lib/decisions-client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-danger">{message}</p>;
}

export function DecisionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const create = useCreateDecision();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DecisionInput>({
    resolver: zodResolver(decisionInputSchema),
    defaultValues: { situation: "", decision: "", reasoning: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const decision = await create.mutateAsync(values);
      toast({
        variant: "success",
        title: "Decision saved",
        description: "Analysis is running in the background.",
      });
      router.push(`/decisions/${decision.id}`);
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not save decision",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="situation">The situation</Label>
            <p className="text-xs text-muted">
              What was the context? The constraints, stakes and people involved.
            </p>
            <Textarea
              id="situation"
              rows={5}
              placeholder="I was offered a senior role at a startup while comfortable at my current job…"
              {...register("situation")}
            />
            <FieldError message={errors.situation?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="decision">The decision you made</Label>
            <p className="text-xs text-muted">
              State the choice plainly, in one or two sentences.
            </p>
            <Textarea
              id="decision"
              rows={3}
              placeholder="I accepted the offer and resigned the next week."
              {...register("decision")}
            />
            <FieldError message={errors.decision?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reasoning">
              Your reasoning{" "}
              <span className="font-normal text-faint">(optional)</span>
            </Label>
            <p className="text-xs text-muted">
              Why did you decide this way? This helps the model judge quality.
            </p>
            <Textarea
              id="reasoning"
              rows={3}
              placeholder="The upside felt larger than the risk, and I was bored…"
              {...register("reasoning")}
            />
            <FieldError message={errors.reasoning?.message} />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" loading={create.isPending}>
              <Sparkles className="size-4" />
              Analyse decision
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
