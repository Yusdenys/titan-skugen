"use client";

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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "./product-card";

export function DefineProductForm() {
  const [formData, setFormData] = useState({
    typeOfShears: "",
    segment: "",
    size: "",
    numberOfTeeth: "",
    color: "",
  });
  const [serialNumber, setSerialNumber] = useState("");
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Limpiar numberOfTeeth si se cambia a un segmento que no lo requiere
      if (field === 'segment' && value !== 'thinning' && value !== 'blending') {
        updated.numberOfTeeth = "";
      }
      
      return updated;
    });
    
    // Generar número de serie cuando cambien campos relevantes
    if (['typeOfShears', 'segment', 'size', 'color'].includes(field)) {
      generateSerialNumber({ ...formData, [field]: value });
    }
  };

  const generateSerialNumber = async (data) => {
    // Solo generar si todos los campos necesarios están completos
    if (!data.typeOfShears || !data.segment || !data.size || !data.color) {
      setSerialNumber("");
      return;
    }

    try {
      // Obtener tijeras de la BD para calcular el número de serie
      const response = await fetch('/api/scissors');
      const result = await response.json();
      
      const prefix = data.typeOfShears === 'grooming' ? 'G' : 'B';
      let groupNumber = 1;
      let incrementalNumber = 1;
      
      if (result.success && result.data) {
        // Filtrar tijeras del mismo tipo (Grooming o Beauty)
        const sameTypeScissors = result.data.filter(s => 
          s.type_of_shears === data.typeOfShears
        );
        
        // Crear un mapa de combinaciones únicas (sin edge y sin series)
        const uniqueCombinations = new Map();
        sameTypeScissors.forEach(s => {
          const key = `${s.segment}_${s.size}_${s.color}`;
          if (!uniqueCombinations.has(key)) {
            uniqueCombinations.set(key, []);
          }
          uniqueCombinations.get(key).push(s);
        });
        
        // Buscar la combinación actual (sin edge y sin series)
        const currentKey = `${data.segment}_${data.size}_${data.color}`;
        
        // Si esta combinación ya existe, obtener su grupo
        if (uniqueCombinations.has(currentKey)) {
          // Encontrar el número de grupo buscando en los serial_numbers existentes
          const existingScissors = uniqueCombinations.get(currentKey);
          if (existingScissors.length > 0 && existingScissors[0].serial_number) {
            // Extraer el número de grupo del serial_number existente (ej: G2 de "G2-001")
            const match = existingScissors[0].serial_number.match(/[GB](\d+)-/);
            if (match) {
              groupNumber = parseInt(match[1]);
            }
          }
          incrementalNumber = existingScissors.length + 1;
        } else {
          // Es una combinación nueva, asignarle el siguiente número de grupo
          groupNumber = uniqueCombinations.size + 1;
          incrementalNumber = 1;
        }
      }
      
      // Generar el número de serie
      const serialNum = `${prefix}${groupNumber}-${String(incrementalNumber).padStart(3, '0')}`;
      setSerialNumber(serialNum);
    } catch (error) {
      console.error('Error generating serial number:', error);
      // Si falla la conexión a BD, usar contador local
      const prefix = data.typeOfShears === 'grooming' ? 'G' : 'B';
      setSerialNumber(`${prefix}1-001`);
    }
  };

  const generateSku = () => {
    const { segment, size, numberOfTeeth, color } = formData;
    
    // Verificar campos básicos y serial number
    if (!segment || !size || !color || !serialNumber) {
      return "";
    }

    // Verificar si necesita numberOfTeeth
    const needsTeeth = segment === 'thinning' || segment === 'blending';
    if (needsTeeth && !numberOfTeeth) {
      return "";
    }

    // Mapear segmentos a sus iniciales
    const segmentMap = {
      'thinning': 'T',
      'straight': 'S',
      'curved': 'C',
      'blending': 'B'
    };

    // Obtener inicial del segmento
    const segmentInitial = segmentMap[segment] || '';
    
    // Obtener las dos primeras letras del Serial Number (ej: "G1" de "G1-001")
    const seriesForSku = serialNumber.substring(0, 2);
    
    // Remover el punto del tamaño para el SKU
    const sizeForSku = size.replace('.', '');
    
    // Obtener las dos letras del color
    const colorCode = color;
    
    // Generar SKU con el patrón: [Segment][G1/B1][Size][Number of teeth]T[Color]
    if (needsTeeth) {
      return `${segmentInitial}${seriesForSku}${sizeForSku}${numberOfTeeth}T${colorCode}`;
    } else {
      // Si no necesita teeth, se omite ese campo
      return `${segmentInitial}${seriesForSku}${sizeForSku}${colorCode}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos básicos
    if (!formData.typeOfShears || !formData.segment || !formData.size || !formData.color) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Validar numberOfTeeth si es necesario
    const needsTeeth = formData.segment === 'thinning' || formData.segment === 'blending';
    if (needsTeeth && !formData.numberOfTeeth) {
      toast({
        title: "Validation Error",
        description: "Number of teeth is required for Thinning and Blending segments.",
        variant: "destructive"
      });
      return;
    }

    // Guardar en la base de datos
    try {
      const sku = generateSku();
      const response = await fetch('/api/scissors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sku,
          serialNumber,
          typeOfShears: formData.typeOfShears,
          segment: formData.segment,
          size: formData.size,
          numberOfTeeth: formData.numberOfTeeth || null,
          color: formData.color,
          colorName: formData.color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error saving scissor');
      }

      toast({
        title: "Product Saved Successfully",
        description: `Serial: ${serialNumber} | SKU: ${sku} has been saved to the database.`,
      });
    } catch (error) {
      console.error('Error saving scissor:', error);
      
      // Mensaje especial si es error de conexión a BD
      if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
        toast({
          title: "Database Not Connected",
          description: "PostgreSQL is not configured. See SETUP_DATABASE.md for instructions. SKU generation still works offline!",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Saving Product",
          description: error.message,
          variant: "destructive"
        });
      }
      return; // No limpiar el formulario si hay error
    }

    // Limpiar formulario después del envío
    setFormData({
      typeOfShears: "",
      segment: "",
      size: "",
      numberOfTeeth: "",
      color: "",
    });
    setSerialNumber("");
  };

  const handleReset = () => {
    setFormData({
      typeOfShears: "",
      segment: "",
      size: "",
      numberOfTeeth: "",
      color: "",
    });
    setSerialNumber("");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Define Product Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-light">Define Product</CardTitle>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type of Shears Field */}
              <div className="space-y-2">
                <Label htmlFor="typeOfShears">Type of Shears</Label>
                <Select
                  value={formData.typeOfShears}
                  onValueChange={(value) => handleInputChange("typeOfShears", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grooming">Grooming</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Segment Field */}
              <div className="space-y-2">
                <Label htmlFor="segment">Segment</Label>
                <Select
                  value={formData.segment}
                  onValueChange={(value) => handleInputChange("segment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thinning">Thinning</SelectItem>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="curved">Curved</SelectItem>
                    <SelectItem value="blending">Blending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Teeth Field - Al lado de Segment, solo visible para Thinning y Blending */}
              {(formData.segment === 'thinning' || formData.segment === 'blending') && (
                <div className="space-y-2">
                  <Label htmlFor="numberOfTeeth">Number of teeth</Label>
                  <Input
                    id="numberOfTeeth"
                    type="number"
                    value={formData.numberOfTeeth}
                    onChange={(e) => handleInputChange("numberOfTeeth", e.target.value)}
                    placeholder="Enter number of teeth"
                    min="1"
                    step="1"
                  />
                </div>
              )}

              {/* Size Field */}
              <div className="space-y-2">
                <Label htmlFor="size">Size (inches)</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => handleInputChange("size", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="3.5">3.5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="4.5">4.5</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="5.5">5.5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="6.5">6.5</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="7.5">7.5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="8.5">8.5</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Field */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleInputChange("color", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CH">CH - Chrome - Acero pulido clásico, acabado espejo</SelectItem>
                    <SelectItem value="BK">BK - Black - Negro mate o brillante</SelectItem>
                    <SelectItem value="GD">GD - Gold - Dorado brillante, elegante</SelectItem>
                    <SelectItem value="RG">RG - Rose Gold - Oro rosado, sofisticado</SelectItem>
                    <SelectItem value="RB">RB - Rainbow - Iridiscente multicolor, estilo moderno</SelectItem>
                    <SelectItem value="SL">SL - Silver - Plata estándar, neutro</SelectItem>
                    <SelectItem value="PR">PR - Purple - Morado metálico o pastel</SelectItem>
                    <SelectItem value="BL">BL - Blue - Azul eléctrico o cobalto</SelectItem>
                    <SelectItem value="RD">RD - Red - Rojo metálico o vino</SelectItem>
                    <SelectItem value="GR">GR - Graphite - Gris oscuro, industrial</SelectItem>
                    <SelectItem value="GN">GN - Green - Verde esmeralda o jade</SelectItem>
                    <SelectItem value="WT">WT - White - Blanco perla o nacarado</SelectItem>
                    <SelectItem value="BR">BR - Bronze - Bronce antiguo o satinado</SelectItem>
                    <SelectItem value="CP">CP - Copper - Cobre pulido, cálido y llamativo</SelectItem>
                    <SelectItem value="AQ">AQ - Aqua - Azul verdoso, tono tropical</SelectItem>
                    <SelectItem value="PK">PK - Pink - Rosa pastel o fucsia</SelectItem>
                    <SelectItem value="OR">OR - Orange - Naranja metálico o coral</SelectItem>
                    <SelectItem value="TI">TI - Titanium - Gris azulado con acabado técnico</SelectItem>
                    <SelectItem value="LB">LB - Light Blue - Azul celeste o pastel</SelectItem>
                    <SelectItem value="LV">LV - Lavender - Lila suave, relajante</SelectItem>
                    <SelectItem value="EM">EM - Emerald - Verde profundo, elegante</SelectItem>
                    <SelectItem value="AM">AM - Amethyst - Púrpura cristalino, inspirado en gemas</SelectItem>
                    <SelectItem value="SN">SN - Snow - Blanco brillante con reflejo frío</SelectItem>
                    <SelectItem value="CF">CF - Carbon Fiber - Negro texturizado con patrón técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button type="submit">
                Define Product
              </Button>
            </div>
          </form>

          {/* Serial Number and SKU Generation Section */}
          {serialNumber && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-700 dark:text-blue-400">Serial Number:</h4>
              <div className="flex items-center justify-between">
                <code className="text-xl font-mono font-bold text-blue-700 dark:text-blue-400 bg-background px-4 py-2 rounded border">
                  {serialNumber}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(serialNumber);
                    toast({
                      title: "Serial Number Copied",
                      description: "Serial number has been copied to clipboard.",
                    });
                  }}
                >
                  Copy Serial
                </Button>
              </div>
            </div>
          )}

          {generateSku() && (
            <div className="mt-4 p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-medium mb-3 text-primary">Generated SKU:</h4>
              <div className="flex items-center justify-between">
                <code className="text-2xl font-mono font-bold text-primary bg-background px-4 py-2 rounded border">
                  {generateSku()}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSku());
                    toast({
                      title: "SKU Copied",
                      description: "SKU has been copied to clipboard.",
                    });
                  }}
                >
                  Copy SKU
                </Button>
              </div>
            </div>
          )}

        </CardContent>
        </Card>

        {/* Product Card */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Product</h2>
          <ProductCard 
            productData={formData}
            serialNumber={serialNumber}
            sku={Object.values(formData).some(value => value !== "") ? generateSku() : ""}
          />
        </div>
      </div>
    </div>
  );
}
