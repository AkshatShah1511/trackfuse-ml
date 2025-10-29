import { DetectionTab } from "./DetectionTab";

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Defect Detection</h1>
        <p className="text-muted-foreground">
          Upload an image to analyze for defects using AI-powered classification
        </p>
      </div>

      <DetectionTab />
    </div>
  );
}
