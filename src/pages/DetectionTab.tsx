import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionResponse {
  predicted_class: "Defective" | "Non Defective";
  confidence: number;
  raw_score?: number; // <-- 1. Made this optional to prevent type errors
}

export function DetectionTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPG, JPEG, or PNG)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setError(null);
      setSelectedFile(file);
      setPrediction(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image file first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // This uses the proxy from vite.config.ts
      const response = await fetch("/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          response.status === 404
            ? "Backend service not found. (Is app.py running?)"
            : response.status === 500
            ? "Server error. (Check app.py console for errors)"
            : `Server error (${response.status}): ${errorText || response.statusText}`
        );
      }

      const data: PredictionResponse = await response.json();
      setPrediction(data);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setError(
          "Cannot connect to the prediction server. (Is your Vite server running?)"
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to analyze image. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confidencePercentage = prediction
    ? Math.round(prediction.confidence * 100)
    : 0;
  const isDefective = prediction?.predicted_class === "Defective";

  return (
    <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Image Upload & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="image-upload"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Select Image
              </label>
              <Input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="cursor-pointer"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, JPEG, PNG (Max 10MB)
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Image Preview */}
            {previewUrl && (
              <div className="space-y-3">
                <div className="relative w-full max-w-2xl mx-auto">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto rounded-lg border border-border shadow-sm max-h-96 object-contain bg-muted/30"
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Detect Defects
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Prediction Results */}
          {prediction && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Analysis Result
                </h3>
              </div>

              <div
                className={cn(
                  "p-6 rounded-lg border-2 transition-colors",
                  isDefective
                    ? "bg-destructive/5 border-destructive/30"
                    : "bg-success/5 border-success/30"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {isDefective ? (
                      <XCircle className="h-8 w-8 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Predicted Class
                      </p>
                      <Badge
                        className={cn(
                          "text-base px-4 py-1.5",
                          isDefective
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-success text-success-foreground"
                        )}
                      >
                        {prediction.predicted_class}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Confidence Score
                      </span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          isDefective ? "text-destructive" : "text-success"
                        )}
                      >
                        {confidencePercentage}%
                      </span>
                    </div>
                    <Progress
                      value={confidencePercentage}
                      className={cn(
                        "h-3",
                        isDefective ? "[&>div]:bg-destructive" : "[&>div]:bg-success"
                      )}
                    />
                  </div>

                  {/* 2. Conditionally render this block only if raw_score exists */}
                  {prediction.raw_score !== undefined && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Raw Score: {prediction.raw_score.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !prediction && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing image...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
  );
}