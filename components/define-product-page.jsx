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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "./product-card";
import { ScissorsList } from "./scissors-list";

export function DefineProductPage() {
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
      const updated = { ...prev, [field]: value };
      
      // Limpiar numberOfTeeth si el segmento cambia a uno que no lo requiere
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
    if (!formData.typeOfShears || !segment || !size || !color || !serialNumber) {
      return "";
    }

    // Verificar numberOfTeeth si es necesario
    const needsTeeth = segment === 'thinning' || segment === 'blending';
    if (needsTeeth && !numberOfTeeth) {
      return "";
    }

    // Generar SKU: [Segment][SerialPrefix][Size][Teeth][Color]
    const segmentPrefix = segment.charAt(0).toUpperCase();
    const serialPrefix = serialNumber.substring(0, 2); // G1, B2, etc.
    const sizeFormatted = size.replace('.', ''); // 5.5 -> 55
    const teethPart = needsTeeth ? `${numberOfTeeth}T` : '';
    
    return `${segmentPrefix}${serialPrefix}${sizeFormatted}${teethPart}${color}`;
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

    const sku = generateSku();
    
    if (!sku) {
      toast({
        title: "Error",
        description: "Could not generate SKU. Please check your inputs.",
        variant: "destructive"
      });
      return;
    }

    try {
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
        throw new Error(data.error || 'Failed to save scissor');
      }

      toast({
        title: "Success!",
        description: `Scissor saved with SKU: ${sku} and Serial: ${serialNumber}`,
      });

      // Limpiar formulario después del envío
      setFormData({
        typeOfShears: "",
        segment: "",
        size: "",
        numberOfTeeth: "",
        color: "",
      });
      setSerialNumber("");
    } catch (error) {
      console.error('Error saving scissor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save scissor",
        variant: "destructive"
      });
      return; // No limpiar el formulario si hay error
    }
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
    <div className="max-w-8xl mx-auto space-y-8">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Define Product Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold text-blue-900 dark:text-blue-100">Define Product</CardTitle>
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

                  {/* Number of Teeth Field - Solo visible para Thinning y Blending */}
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
                        <SelectItem value="CH">CH - Chrome</SelectItem>
                        <SelectItem value="BK">BK - Black</SelectItem>
                        <SelectItem value="GD">GD - Gold</SelectItem>
                        <SelectItem value="RG">RG - Rose Gold</SelectItem>
                        <SelectItem value="RB">RB - Rainbow</SelectItem>
                        <SelectItem value="SL">SL - Silver</SelectItem>
                        <SelectItem value="PR">PR - Purple</SelectItem>
                        <SelectItem value="BL">BL - Blue</SelectItem>
                        <SelectItem value="RD">RD - Red</SelectItem>
                        <SelectItem value="GR">GR - Graphite</SelectItem>
                        <SelectItem value="GN">GN - Green</SelectItem>
                        <SelectItem value="WT">WT - White</SelectItem>
                        <SelectItem value="BR">BR - Bronze</SelectItem>
                        <SelectItem value="CP">CP - Copper</SelectItem>
                        <SelectItem value="AQ">AQ - Aqua</SelectItem>
                        <SelectItem value="PK">PK - Pink</SelectItem>
                        <SelectItem value="OR">OR - Orange</SelectItem>
                        <SelectItem value="TI">TI - Titanium</SelectItem>
                        <SelectItem value="LB">LB - Light Blue</SelectItem>
                        <SelectItem value="LV">LV - Lavender</SelectItem>
                        <SelectItem value="EM">EM - Emerald</SelectItem>
                        <SelectItem value="AM">AM - Amethyst</SelectItem>
                        <SelectItem value="SN">SN - Snow</SelectItem>
                        <SelectItem value="CF">CF - Carbon Fiber</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Generate SKU
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Product Card */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle className="font-semibold text-blue-900 dark:text-blue-100">Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductCard 
                        productData={formData}
                        serialNumber={serialNumber}
                        sku={Object.values(formData).some(value => value !== "") ? generateSku() : ""}
                    />
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Scissors Database Section */}
      <div className="space-y-6">
        <ScissorsList />
      </div>
    </div>
  );
}
