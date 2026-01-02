import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { useCreateBulkIngredients } from "~/hooks";
import { APP_CONFIG } from "~/config/app";
import type { IngredientUnit } from "~/types";

export function meta() {
  return [
    { title: `Upload Ingredients - ${APP_CONFIG.name}` },
    {
      name: "description",
      content: "Bulk upload ingredients from Excel or CSV",
    },
  ];
}

interface ParsedIngredient {
  name: string;
  unit: IngredientUnit;
  pricePerUnit: number;
  currentStock: number;
  reorderLevel: number;
  supplier?: string;
  isValid: boolean;
  errors: string[];
}

const validUnits: IngredientUnit[] = [
  "kg",
  "g",
  "L",
  "mL",
  "pcs",
  "pack",
  "bottle",
  "can",
  "bundle",
];

export default function IngredientsUploadPage() {
  const navigate = useNavigate();
  const createBulkIngredientsMutation = useCreateBulkIngredients();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedIngredient[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validateRow = (row: Record<string, unknown>): ParsedIngredient => {
    const errors: string[] = [];

    const name = String(row["Name"] || row["name"] || "").trim();
    const unitRaw = String(row["Unit"] || row["unit"] || "")
      .toLowerCase()
      .trim();
    const priceRaw =
      row["Price Per Unit"] || row["price_per_unit"] || row["Price"] || 0;
    const stockRaw =
      row["Current Stock"] || row["current_stock"] || row["Stock"] || 0;
    const reorderRaw =
      row["Reorder Level"] || row["reorder_level"] || row["Reorder"] || 0;
    const supplier = String(row["Supplier"] || row["supplier"] || "").trim();

    if (!name) errors.push("Name is required");

    const unit = validUnits.find(
      (u) => u.toLowerCase() === unitRaw
    ) as IngredientUnit;
    if (!unit) errors.push(`Invalid unit: ${unitRaw}`);

    const pricePerUnit = parseFloat(String(priceRaw));
    if (isNaN(pricePerUnit) || pricePerUnit <= 0) errors.push("Invalid price");

    const currentStock = parseFloat(String(stockRaw));
    if (isNaN(currentStock) || currentStock < 0) errors.push("Invalid stock");

    const reorderLevel = parseFloat(String(reorderRaw));
    if (isNaN(reorderLevel) || reorderLevel < 0)
      errors.push("Invalid reorder level");

    return {
      name,
      unit: unit || "pcs",
      pricePerUnit: isNaN(pricePerUnit) ? 0 : pricePerUnit,
      currentStock: isNaN(currentStock) ? 0 : currentStock,
      reorderLevel: isNaN(reorderLevel) ? 0 : reorderLevel,
      supplier: supplier || undefined,
      isValid: errors.length === 0,
      errors,
    };
  };

  const parseFile = useCallback((file: File) => {
    setUploadError(null);
    setUploadSuccess(false);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setUploadError("The file appears to be empty");
          return;
        }

        const parsed = jsonData.map((row) =>
          validateRow(row as Record<string, unknown>)
        );
        setParsedData(parsed);
      } catch (error) {
        console.error("Parse error:", error);
        setUploadError(
          "Failed to parse file. Please ensure it's a valid Excel or CSV file."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleRemoveRow = (index: number) => {
    setParsedData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    const validItems = parsedData.filter((item) => item.isValid);
    if (validItems.length === 0) {
      setUploadError("No valid items to import");
      return;
    }

    setIsLoading(true);

    createBulkIngredientsMutation.mutate(
      validItems.map((item) => ({
        name: item.name,
        unit: item.unit,
        costPerUnit: item.pricePerUnit,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        supplier: item.supplier,
      })),
      {
        onSuccess: () => {
          setUploadSuccess(true);
          setTimeout(() => navigate("/dashboard/ingredients"), 1500);
        },
        onError: (error) => {
          console.error("Import error:", error);
          setUploadError("Failed to import ingredients");
          setIsLoading(false);
        },
      }
    );
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: "Rice",
        Unit: "kg",
        "Price Per Unit": 55,
        "Current Stock": 25,
        "Reorder Level": 10,
        Supplier: "Carbon Market",
      },
      {
        Name: "Pork Belly",
        Unit: "kg",
        "Price Per Unit": 280,
        "Current Stock": 5,
        "Reorder Level": 3,
        Supplier: "Meat Supplier Co.",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ingredients");
    XLSX.writeFile(wb, "ingredients_template.xlsx");
  };

  const validCount = parsedData.filter((i) => i.isValid).length;
  const invalidCount = parsedData.filter((i) => !i.isValid).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        asChild
        className="-ml-2 text-gray-600 hover:text-gray-900"
      >
        <Link to="/dashboard/ingredients">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ingredients
        </Link>
      </Button>

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bulk Upload Ingredients
          </h1>
          <p className="text-gray-500 mt-1">
            Import ingredients from an Excel or CSV file
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="border-gray-200 text-gray-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <Card className="border-secondary/20 bg-secondary/5 shadow-none">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            <p className="text-secondary font-medium">
              Successfully imported {validCount} ingredients! Redirecting...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {uploadError && (
        <Card className="border-red-100 bg-red-50 shadow-none">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-600">{uploadError}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Zone */}
      {!parsedData.length && (
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
              </div>
              Upload File
            </CardTitle>
            <CardDescription className="text-gray-500">
              Drag and drop your Excel (.xlsx) or CSV file, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }
              `}
            >
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your file here
              </p>
              <p className="text-gray-500 mb-4">
                or click to browse from your computer
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button asChild variant="outline" className="border-gray-200">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>

            {/* Format Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">
                Required Columns:
              </h4>
              <div className="grid gap-1 text-sm text-gray-500">
                <p>
                  <strong className="text-gray-700">Name</strong> - Ingredient
                  name (required)
                </p>
                <p>
                  <strong className="text-gray-700">Unit</strong> - kg, g, L,
                  mL, pcs, pack, bottle, can, bundle
                </p>
                <p>
                  <strong className="text-gray-700">Price Per Unit</strong> -
                  Cost per unit in PHP
                </p>
                <p>
                  <strong className="text-gray-700">Current Stock</strong> -
                  Current inventory amount
                </p>
                <p>
                  <strong className="text-gray-700">Reorder Level</strong> -
                  Alert when stock falls below this
                </p>
                <p>
                  <strong className="text-gray-700">Supplier</strong> - Supplier
                  name (optional)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {parsedData.length > 0 && !uploadSuccess && (
        <Card className="border shadow-none bg-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-gray-900">Preview Import</CardTitle>
                <CardDescription className="text-gray-500">
                  {fileName} • {parsedData.length} rows found
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/10">
                  {validCount} valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                    {invalidCount} errors
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="text-gray-500 font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-500 font-medium">
                      Name
                    </TableHead>
                    <TableHead className="text-gray-500 font-medium">
                      Unit
                    </TableHead>
                    <TableHead className="text-right text-gray-500 font-medium">
                      Price
                    </TableHead>
                    <TableHead className="text-right text-gray-500 font-medium">
                      Stock
                    </TableHead>
                    <TableHead className="text-right text-gray-500 font-medium">
                      Reorder
                    </TableHead>
                    <TableHead className="text-gray-500 font-medium">
                      Supplier
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={
                        !item.isValid ? "bg-red-50" : "border-gray-100"
                      }
                    >
                      <TableCell>
                        {item.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-secondary" />
                        ) : (
                          <span title={item.errors.join(", ")}>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {item.name || "—"}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {item.unit || "—"}
                      </TableCell>
                      <TableCell className="text-right text-gray-900">
                        ₱{item.pricePerUnit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-gray-900">
                        {item.currentStock}
                      </TableCell>
                      <TableCell className="text-right text-gray-900">
                        {item.reorderLevel}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {item.supplier || "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleRemoveRow(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {parsedData.length > 0 && !uploadSuccess && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-700"
            onClick={() => {
              setParsedData([]);
              setFileName(null);
            }}
          >
            Clear & Start Over
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-gray-200 text-gray-700"
              asChild
            >
              <Link to="/dashboard/ingredients">Cancel</Link>
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || validCount === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Importing..." : `Import ${validCount} Ingredients`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
