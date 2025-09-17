import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Download,
  Calendar as CalendarIcon,
  Package,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'react-qr-code';

interface FormData {
  vendorName: string;
  lotNumber: string;
  itemType: string;
  manufactureDate: Date | undefined;
  supplyDate: Date | undefined;
  warrantyPeriod: string;
}

interface GeneratedData {
  qrCode: string;
  pdfUrl: string;
  filename: string;
  timestamp: number;
}

export function QRGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    vendorName: "",
    lotNumber: "",
    itemType: "",
    manufactureDate: undefined,
    supplyDate: undefined,
    warrantyPeriod: "",
  });
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const itemTypes = [
    "Elastic Rail Clip",
    "Rail Pad",
    "Rail Liner",
    "Concrete Sleeper",
    "Wooden Sleeper",
  ];

  const warrantyPeriods = [
    "12 months",
    "18 months",
    "24 months",
    "36 months",
    "48 months",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorName || !formData.lotNumber || !formData.itemType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // First, generate the PDF
      const pdfResponse = await fetch('https://rail-dash0-1.onrender.com/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName: formData.vendorName,
          lotNumber: formData.lotNumber,
          itemType: formData.itemType,
          manufactureDate: formData.manufactureDate?.toISOString(),
          supplyDate: formData.supplyDate?.toISOString(),
          warrantyPeriod: formData.warrantyPeriod,
        }),
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      const pdfData = await pdfResponse.json();

      // Use the full URL provided by the backend
      const pdfUrl = pdfData.fullUrl || `https://rail-dash0-1.onrender.com${pdfData.filepath}`;

      // Now generate the QR code that links to the PDF
      const qrResponse = await fetch('https://rail-dash0-1.onrender.com/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrl }),
      });

      if (!qrResponse.ok) {
        throw new Error('Failed to generate QR code');
      }

      const qrData = await qrResponse.json();

      setGeneratedData({
        qrCode: qrData.qrCode,
        pdfUrl: pdfUrl,
        filename: pdfData.filename,
        timestamp: pdfData.timestamp,
      });

      toast({
        title: "Success!",
        description: "QR code and PDF generated successfully.",
      });

    } catch (error) {
      console.error('Error generating QR code and PDF:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code and PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedData) {
      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = generatedData.pdfUrl;
      link.download = generatedData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "PDF download has begun.",
      });
    }
  };

  const openPDF = () => {
    if (generatedData) {
      window.open(generatedData.pdfUrl, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Generate QR codes for railway track fittings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Item Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name *</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g., RailTech Solutions"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lotNumber">Lot Number *</Label>
                <Input
                  id="lotNumber"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  placeholder="e.g., LOT-2024-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Item Type *</Label>
                <Select
                  value={formData.itemType}
                  onValueChange={(value) => setFormData({ ...formData, itemType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Manufacture Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.manufactureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.manufactureDate ? (
                          format(formData.manufactureDate, "PPP")
                        ) : (
                          <span>Pick date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.manufactureDate}
                        onSelect={(date) => setFormData({ ...formData, manufactureDate: date })}
                        className="pointer-events-auto"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Supply Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.supplyDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.supplyDate ? (
                          format(formData.supplyDate, "PPP")
                        ) : (
                          <span>Pick date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.supplyDate}
                        onSelect={(date) => setFormData({ ...formData, supplyDate: date })}
                        className="pointer-events-auto"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Warranty Period</Label>
                <Select
                  value={formData.warrantyPeriod}
                  onValueChange={(value) => setFormData({ ...formData, warrantyPeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warranty period" />
                  </SelectTrigger>
                  <SelectContent>
                    {warrantyPeriods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>Generating QR Code...</>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* QR Code Preview Section */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Generated QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedData ? (
              <div className="text-center space-y-6">
                {/* Real QR Code */}
                <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                  <QRCode
                    value={generatedData.pdfUrl}
                    size={200}
                    level="H"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-semibold">QR Code Generated Successfully</span>
                  </div>

                  <Badge variant="outline" className="text-sm">
                    ID: {generatedData.timestamp}
                  </Badge>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Vendor:</strong> {formData.vendorName}</p>
                    <p><strong>Lot:</strong> {formData.lotNumber}</p>
                    <p><strong>Type:</strong> {formData.itemType}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleDownload} className="w-full btn-success">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>

                  <Button onClick={openPDF} variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View PDF
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Scan this QR code with any mobile device to view the PDF</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill out the form to generate a QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}