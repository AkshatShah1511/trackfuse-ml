import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Mail, 
  Phone,
  Building,
  Shield,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "vendor" | "inspector" | "admin";
  company: string;
  status: "active" | "inactive";
  joinDate: string;
}

const initialUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@railtech.com",
    phone: "+1-555-0123",
    role: "vendor",
    company: "RailTech Solutions",
    status: "active",
    joinDate: "2023-01-15"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@trackfit.com",
    phone: "+1-555-0124",
    role: "vendor",
    company: "TrackFit Industries",
    status: "active",
    joinDate: "2023-02-20"
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "m.chen@railway-inspect.gov",
    phone: "+1-555-0125",
    role: "inspector",
    company: "Railway Authority",
    status: "active",
    joinDate: "2023-03-10"
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@steelrail.com",
    phone: "+1-555-0126",
    role: "vendor",
    company: "SteelRail Corp",
    status: "active",
    joinDate: "2023-04-05"
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "r.wilson@railway-inspect.gov",
    phone: "+1-555-0127",
    role: "inspector",
    company: "Railway Authority",
    status: "inactive",
    joinDate: "2023-05-12"
  },
];

export function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const filteredUsers = users.filter((user) => {
    return (
      (searchTerm === "" || 
       user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.company.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRole === "" || user.role === selectedRole)
    );
  });

  const handleAddUser = () => {
    toast({
      title: "User Added",
      description: "New user has been successfully added to the system.",
    });
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Removed",
      description: `${userName} has been removed from the system.`,
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary text-primary-foreground">Admin</Badge>;
      case "inspector":
        return <Badge className="bg-success text-success-foreground">Inspector</Badge>;
      case "vendor":
        return <Badge variant="outline">Vendor</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge className="status-active">Active</Badge>
      : <Badge className="status-warning">Inactive</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage vendors, inspectors, and administrators</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Enter company name" />
              </div>
              <Button onClick={handleAddUser} className="w-full btn-primary">
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{users.length}</h3>
            <p className="text-muted-foreground text-sm font-medium">Total Users</p>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-success/10 text-success">
              <Building className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {users.filter(user => user.role === "vendor").length}
            </h3>
            <p className="text-muted-foreground text-sm font-medium">Vendors</p>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {users.filter(user => user.role === "inspector").length}
            </h3>
            <p className="text-muted-foreground text-sm font-medium">Inspectors</p>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {users.filter(user => user.status === "active").length}
            </h3>
            <p className="text-muted-foreground text-sm font-medium">Active Users</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="dashboard-card">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="inspector">Inspector</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.company}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                <span className="text-xs text-muted-foreground">
                  Joined {user.joinDate}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}