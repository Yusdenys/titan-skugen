"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Scissors, 
  TrendingUp, 
  RefreshCw,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ScissorsDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    bySegment: {},
    byColor: {},
    bySize: {},
    recentScissors: [],
    avgTeeth: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scissors');
      const data = await response.json();
      
      if (data.success) {
        const scissors = data.data;
        
        // Calcular estadísticas
        const byType = scissors.reduce((acc, s) => {
          acc[s.type_of_shears] = (acc[s.type_of_shears] || 0) + 1;
          return acc;
        }, {});

        const bySegment = scissors.reduce((acc, s) => {
          acc[s.segment] = (acc[s.segment] || 0) + 1;
          return acc;
        }, {});

        const byColor = scissors.reduce((acc, s) => {
          acc[s.color] = (acc[s.color] || 0) + 1;
          return acc;
        }, {});

        const bySize = scissors.reduce((acc, s) => {
          acc[s.size] = (acc[s.size] || 0) + 1;
          return acc;
        }, {});

        const scissorsWithTeeth = scissors.filter(s => s.number_of_teeth);
        const avgTeeth = scissorsWithTeeth.length > 0
          ? Math.round(scissorsWithTeeth.reduce((sum, s) => sum + s.number_of_teeth, 0) / scissorsWithTeeth.length)
          : 0;

        const recentScissors = scissors
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setStats({
          total: scissors.length,
          byType,
          bySegment,
          byColor,
          bySize,
          recentScissors,
          avgTeeth
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // No mostrar toast si es error de conexión a BD (esperado si no está configurada)
      if (!error.message.includes('ECONNREFUSED')) {
        toast({
          title: "Error Loading Statistics",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getTopItems = (obj, limit = 5) => {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  const topTypes = getTopItems(stats.byType);
  const topSegments = getTopItems(stats.bySegment);
  const topColors = getTopItems(stats.byColor);
  const topSizes = getTopItems(stats.bySize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your scissors inventory
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchStatistics}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Database Not Configured Warning */}
      {!loading && stats.total === 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 dark:text-yellow-400">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  PostgreSQL Not Configured
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  The database is not connected yet. To enable full functionality:
                </p>
                <ol className="text-sm text-yellow-800 dark:text-yellow-200 list-decimal list-inside space-y-1">
                  <li>Follow instructions in <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">SETUP_DATABASE.md</code></li>
                  <li>Create <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.env.local</code> with your database credentials</li>
                  <li>Restart the application</li>
                </ol>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                  You can still use "Define Product" to generate SKUs without database persistence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Scissors
            </CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              In your database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Segments
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.bySegment).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Teeth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTeeth}T</div>
            <p className="text-xs text-muted-foreground">
              For thinning/blending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Colors
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.byColor).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Available options
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle className="font-light">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            {topTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topTypes.map(([type, count]) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          type === 'grooming' ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Segment */}
        <Card>
          <CardHeader>
            <CardTitle className="font-light">By Segment</CardTitle>
          </CardHeader>
          <CardContent>
            {topSegments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topSegments.map(([segment, count]) => (
                  <div key={segment}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{segment}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Color */}
        <Card>
          <CardHeader>
            <CardTitle className="font-light">Top Colors</CardTitle>
          </CardHeader>
          <CardContent>
            {topColors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topColors.map(([color, count]) => (
                  <div key={color}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{color}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Size */}
        <Card>
          <CardHeader>
            <CardTitle className="font-light">Popular Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            {topSizes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topSizes.map(([size, count]) => (
                  <div key={size}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{size}"</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Scissors */}
      <Card>
        <CardHeader>
          <CardTitle className="font-light">Recent Scissors</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentScissors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scissors yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentScissors.map((scissor) => (
                <div 
                  key={scissor.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-mono font-medium">{scissor.sku}</p>
                    <p className="text-sm text-muted-foreground">
                      {scissor.serial_number} • {scissor.size}" • 
                      <span className="capitalize"> {scissor.segment}</span>
                      {scissor.number_of_teeth && ` • ${scissor.number_of_teeth}T`}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(scissor.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

