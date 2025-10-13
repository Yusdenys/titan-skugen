"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Download, 
  Trash2, 
  Edit, 
  RefreshCw,
  Filter,
  X,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ScissorsList() {
  const [scissors, setScissors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSegment, setFilterSegment] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scissorToDelete, setScissorToDelete] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchScissors();
  }, []);

  const fetchScissors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scissors');
      const data = await response.json();
      
      if (data.success) {
        setScissors(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching scissors:', error);
      // No mostrar toast si es error de conexión a BD (esperado si no está configurada)
      if (!error.message.includes('ECONNREFUSED')) {
        toast({
          title: "Error Loading Data",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!scissorToDelete) return;

    try {
      const response = await fetch(`/api/scissors/${scissorToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Scissor Deleted",
          description: `SKU ${scissorToDelete.sku} has been deleted.`,
        });
        fetchScissors();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error Deleting",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setScissorToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const filteredData = getFilteredScissors();
    
    if (filteredData.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no scissors matching your filters.",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      "ID", "Serial Number", "Type of Shears", "SKU", "Segment", "Edge", "Size", 
      "Number of Teeth", "Color", "Created At"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredData.map(scissor => [
        scissor.id,
        scissor.serial_number || "N/A",
        scissor.type_of_shears || "N/A",
        scissor.sku,
        scissor.segment,
        scissor.edge,
        scissor.size,
        scissor.number_of_teeth || "N/A",
        scissor.color,
        new Date(scissor.created_at).toLocaleString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `scissors_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `${filteredData.length} scissors exported to CSV.`,
    });
  };

  const getFilteredScissors = () => {
    return scissors.filter(scissor => {
      const matchesSearch = 
        scissor.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scissor.series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scissor.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = 
        filterType === "all" || scissor.type_of_shears === filterType;
      
      const matchesSegment = 
        filterSegment === "all" || scissor.segment === filterSegment;
      
      const matchesColor = 
        filterColor === "all" || scissor.color === filterColor;

      return matchesSearch && matchesType && matchesSegment && matchesColor;
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterSegment("all");
    setFilterColor("all");
  };

  const filteredScissors = getFilteredScissors();
  const uniqueColors = [...new Set(scissors.map(s => s.color))].sort();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-light">Scissors Database</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchScissors}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                disabled={filteredScissors.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by SKU, Serial or Series..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterType">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterSegment">Segment</Label>
              <Select value={filterSegment} onValueChange={setFilterSegment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Segments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="thinning">Thinning</SelectItem>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="curved">Curved</SelectItem>
                  <SelectItem value="blending">Blending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterColor">Color</Label>
              <Select value={filterColor} onValueChange={setFilterColor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Colors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {uniqueColors.map(color => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredScissors.length} of {scissors.length} scissors
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8">Loading scissors...</div>
          ) : scissors.length === 0 ? (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 dark:text-yellow-400">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Database Not Configured
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                    No scissors found. This could mean:
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 list-disc list-inside space-y-1">
                    <li>PostgreSQL is not configured yet (see <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">SETUP_DATABASE.md</code>)</li>
                    <li>You haven't created any scissors yet (go to "Define Product")</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : filteredScissors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scissors match your filters.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Series</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Teeth</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScissors.map((scissor) => (
                    <TableRow key={scissor.id}>
                      <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                        {scissor.serial_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          scissor.type_of_shears === 'grooming' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {scissor.type_of_shears ? scissor.type_of_shears.charAt(0).toUpperCase() + scissor.type_of_shears.slice(1) : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {scissor.sku}
                      </TableCell>
                      <TableCell className="capitalize">{scissor.segment}</TableCell>
                      <TableCell>{scissor.series}</TableCell>
                      <TableCell>{scissor.size}"</TableCell>
                      <TableCell>
                        {scissor.number_of_teeth ? `${scissor.number_of_teeth}T` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-xs">
                          {scissor.color}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(scissor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setScissorToDelete(scissor);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scissor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{scissorToDelete?.sku}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScissorToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

