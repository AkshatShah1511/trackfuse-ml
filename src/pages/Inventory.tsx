import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  QrCode,
  ExternalLink
} from "lucide-react";
import QRCode from 'react-qr-code';

interface InventoryItem {
  qr_id: string;
  vendor: string;
  lot_number: string;
  item_type: string;
  manufacture_date: string;
  supply_date: string;
  warranty_expiry: string;
  inspection_status: "passed" | "failed" | "pending";
  location: string;
}

const BACKEND_URL = 'http://127.0.0.1:5000';

export function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("ALL");
  const [selectedItemType, setSelectedItemType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [qrById, setQrById] = useState<Record<string, { qr?: string; pdfUrl: string }>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/inventory`);
        if (!res.ok) throw new Error('Failed to fetch inventory');
        const json = await res.json();
        setData(json.data as InventoryItem[]);
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const vendors: string[] = [...new Set((data || []).map(item => item.vendor).filter((v): v is string => Boolean(v)))];
  const itemTypes: string[] = [...new Set((data || []).map(item => item.item_type).filter((v): v is string => Boolean(v)))];

  const filteredData = data.filter((item) => {
    return (
      (searchTerm === "" ||
        item.qr_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lot_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedVendor === "ALL" || item.vendor === selectedVendor) &&
      (selectedItemType === "ALL" || item.item_type === selectedItemType) &&
      (selectedStatus === "ALL" || item.inspection_status === selectedStatus)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="status-active">Passed</Badge>;
      case "failed":
        return <Badge className="status-expired">Failed</Badge>;
      case "pending":
        return <Badge className="status-warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="dashboard-card p-6">
          <div>Loading inventory...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="dashboard-card p-6">
          <div className="text-destructive">Failed to load inventory: {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory & Records</h1>
          <p className="text-muted-foreground">Manage and track railway track fittings</p>
        </div>
        <Button className="btn-primary" onClick={() => {
          const headers = ['QR ID', 'Vendor', 'Lot Number', 'Item Type', 'Manufacture Date', 'Supply Date', 'Warranty Expiry', 'Status', 'Location'];
          const rows = filteredData.map(i => [i.qr_id, i.vendor, i.lot_number, i.item_type, i.manufacture_date, i.supply_date, i.warranty_expiry, i.inspection_status, i.location]);
          const csv = [headers, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'inventory.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="dashboard-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search QR ID, vendor, or lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger>
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Vendors</SelectItem>
                {(vendors || []).map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedItemType} onValueChange={setSelectedItemType}>
              <SelectTrigger>
                <SelectValue placeholder="All Item Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Item Types</SelectItem>
                {(itemTypes || []).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedVendor("ALL");
                setSelectedItemType("ALL");
                setSelectedStatus("ALL");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dashboard-card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div className="text-2xl font-bold">{filteredData.length}</div>
          <div className="text-sm text-muted-foreground">Total Items</div>
        </Card>

        <Card className="dashboard-card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div className="text-2xl font-bold">
            {filteredData.filter(item => item.inspection_status === "passed").length}
          </div>
          <div className="text-sm text-muted-foreground">Passed Inspections</div>
        </Card>

        <Card className="dashboard-card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-2xl font-bold">
            {filteredData.filter(item => item.inspection_status === "failed").length}
          </div>
          <div className="text-sm text-muted-foreground">Failed Inspections</div>
        </Card>

        <Card className="dashboard-card text-center p-4">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <div className="text-2xl font-bold">
            {filteredData.filter(item => item.inspection_status === "pending").length}
          </div>
          <div className="text-sm text-muted-foreground">Pending Inspections</div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="data-table">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Inventory Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead>QR ID</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Lot Number</TableHead>
                <TableHead>Item Type</TableHead>
                <TableHead>Manufacture Date</TableHead>
                <TableHead>Supply Date</TableHead>
                <TableHead>Warranty Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <>
                  <TableRow key={item.qr_id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{item.qr_id}</TableCell>
                    <TableCell>{item.vendor}</TableCell>
                    <TableCell>{item.lot_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.item_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {item.manufacture_date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {item.supply_date}
                      </div>
                    </TableCell>
                    <TableCell>{item.warranty_expiry}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.inspection_status)}
                        {getStatusBadge(item.inspection_status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {item.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={async () => {
                          try {
                            const res = await fetch(`${BACKEND_URL}/api/items/${encodeURIComponent(item.qr_id)}/qr`, { method: 'POST' });
                            if (!res.ok) throw new Error('Failed to generate QR');
                            const data = await res.json();
                            setQrById(prev => ({ ...prev, [item.qr_id]: { qr: data.qrCode, pdfUrl: data.pdfUrl } }));
                            setExpandedRowId(item.qr_id);
                          } catch (e: any) {
                            setError(e.message);
                          }
                        }} title="Generate QR for this item">
                          <QrCode className="h-4 w-4 mr-1" />
                          Generate QR
                        </Button>
                        <Button variant="ghost" size="sm" onClick={async () => {
                          try {
                            const res = await fetch(`${BACKEND_URL}/api/items/${encodeURIComponent(item.qr_id)}/pdf`, { method: 'POST' });
                            if (!res.ok) throw new Error('Failed to generate PDF');
                            const data = await res.json();
                            window.open(data.url, '_blank');
                          } catch (e: any) {
                            setError(e.message);
                          }
                        }} title="Open PDF">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRowId === item.qr_id && qrById[item.qr_id] && (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border border-border/50">
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded shadow">
                              {qrById[item.qr_id].qr ? (
                                <img src={qrById[item.qr_id].qr} alt={`QR for ${item.qr_id}`} width={200} height={200} />
                              ) : (
                                <QRCode value={qrById[item.qr_id].pdfUrl} size={200} level="H" />
                              )}
                            </div>
                            <div className="text-sm">
                              <div className="font-semibold mb-1">QR for {item.qr_id}</div>
                              <div className="text-muted-foreground">Scan to open PDF certificate</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => window.open(qrById[item.qr_id].pdfUrl, '_blank')}>View PDF</Button>
                            <Button variant="outline" onClick={() => {
                              const a = document.createElement('a');
                              a.href = qrById[item.qr_id].pdfUrl;
                              a.download = `item-${item.qr_id}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}>Download PDF</Button>
                            <Button variant="ghost" onClick={() => setExpandedRowId(null)}>Close</Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}