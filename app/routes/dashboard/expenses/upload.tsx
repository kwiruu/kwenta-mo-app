import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { useCreateBulkExpenses } from '~/hooks';
import { APP_CONFIG } from '~/config/app';
import type { ExpenseCategory } from '~/lib/api';

export function meta() {
  return [
    { title: `Upload Expenses - ${APP_CONFIG.name}` },
    {
      name: 'description',
      content: 'Bulk upload operating expenses from Excel or CSV',
    },
  ];
}

interface ParsedExpense {
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
  isValid: boolean;
  errors: string[];
}

const validCategories: ExpenseCategory[] = [
  'INGREDIENTS',
  'LABOR',
  'UTILITIES',
  'RENT',
  'EQUIPMENT',
  'MARKETING',
  'TRANSPORTATION',
  'PACKAGING',
  'OTHER',
];

const categoryLabels: Record<ExpenseCategory, string> = {
  INGREDIENTS: 'Ingredients',
  LABOR: 'Labor',
  UTILITIES: 'Utilities',
  RENT: 'Rent',
  EQUIPMENT: 'Equipment',
  MARKETING: 'Marketing',
  TRANSPORTATION: 'Transportation',
  PACKAGING: 'Packaging',
  OTHER: 'Other',
};

const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

export default function ExpensesUploadPage() {
  const navigate = useNavigate();
  const createBulkExpensesMutation = useCreateBulkExpenses();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExpense[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validateRow = (row: Record<string, unknown>): ParsedExpense => {
    const errors: string[] = [];

    const name = String(row['Name'] || row['name'] || '').trim();
    const categoryRaw = String(row['Category'] || row['category'] || '')
      .toLowerCase()
      .trim();
    const amountRaw = row['Amount'] || row['amount'] || 0;
    const frequencyRaw = String(row['Frequency'] || row['frequency'] || 'monthly')
      .toLowerCase()
      .trim();
    const notes = String(row['Notes'] || row['notes'] || '').trim();

    if (!name) errors.push('Name is required');

    const category = validCategories.find((c) => c === categoryRaw) as ExpenseCategory;
    if (!category) errors.push(`Invalid category: ${categoryRaw}`);

    const amount = parseFloat(String(amountRaw));
    if (isNaN(amount) || amount <= 0) errors.push('Invalid amount');

    const frequency = validFrequencies.find(
      (f) => f === frequencyRaw
    ) as ParsedExpense['frequency'];
    if (!frequency) errors.push(`Invalid frequency: ${frequencyRaw}`);

    return {
      name,
      category: category || 'other',
      amount: isNaN(amount) ? 0 : amount,
      frequency: frequency || 'monthly',
      notes: notes || undefined,
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
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setUploadError('The file appears to be empty');
          return;
        }

        const parsed = jsonData.map((row) => validateRow(row as Record<string, unknown>));
        setParsedData(parsed);
      } catch (error) {
        console.error('Parse error:', error);
        setUploadError("Failed to parse file. Please ensure it's a valid Excel or CSV file.");
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
      setUploadError('No valid items to import');
      return;
    }

    setIsLoading(true);

    // Map frontend category to API category
    const categoryMap: Record<string, ExpenseCategory> = {
      rent: 'RENT',
      utilities: 'UTILITIES',
      salaries: 'LABOR',
      equipment: 'EQUIPMENT',
      maintenance: 'OTHER',
      marketing: 'MARKETING',
      supplies: 'PACKAGING',
      transportation: 'TRANSPORTATION',
      permits: 'OTHER',
      other: 'OTHER',
    };

    createBulkExpensesMutation.mutate(
      validItems.map((item) => ({
        description: item.name,
        category: categoryMap[item.category] || ('OTHER' as ExpenseCategory),
        amount: item.amount,
        notes: item.notes,
      })),
      {
        onSuccess: () => {
          setUploadSuccess(true);
          setTimeout(() => navigate('/dashboard/expenses'), 1500);
        },
        onError: (error) => {
          console.error('Import error:', error);
          setUploadError('Failed to import expenses');
          setIsLoading(false);
        },
      }
    );
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: 'Store Rent',
        Category: 'rent',
        Amount: 8000,
        Frequency: 'monthly',
        Notes: 'Market stall rental',
      },
      {
        Name: 'Electricity',
        Category: 'utilities',
        Amount: 3500,
        Frequency: 'monthly',
        Notes: '',
      },
      {
        Name: 'Helper Salary',
        Category: 'salaries',
        Amount: 500,
        Frequency: 'daily',
        Notes: 'Kitchen helper',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, 'expenses_template.xlsx');
  };

  // Calculate monthly amount for preview
  const getMonthlyAmount = (item: ParsedExpense) => {
    switch (item.frequency) {
      case 'daily':
        return item.amount * 30;
      case 'weekly':
        return item.amount * 4;
      case 'monthly':
        return item.amount;
      case 'quarterly':
        return item.amount / 3;
      case 'yearly':
        return item.amount / 12;
      default:
        return item.amount;
    }
  };

  const validCount = parsedData.filter((i) => i.isValid).length;
  const invalidCount = parsedData.filter((i) => !i.isValid).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="-ml-2 text-gray-600 hover:text-gray-900">
        <Link to="/dashboard/expenses">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Expenses
        </Link>
      </Button>

      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bulk Upload Expenses</h1>
          <p className="text-gray-500 mt-1">Import operating expenses from an Excel or CSV file</p>
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
              Successfully imported {validCount} expenses! Redirecting...
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
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                <FileSpreadsheet className="h-4 w-4 text-red-500" />
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
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }
              `}
            >
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">Drop your file here</p>
              <p className="text-gray-500 mb-4">or click to browse from your computer</p>
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
              <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
              <div className="grid gap-1 text-sm text-gray-500">
                <p>
                  <strong className="text-gray-700">Name</strong> - Expense name (required)
                </p>
                <p>
                  <strong className="text-gray-700">Category</strong> - rent, utilities, salaries,
                  equipment, maintenance, marketing, supplies, transportation, permits, other
                </p>
                <p>
                  <strong className="text-gray-700">Amount</strong> - Expense amount in PHP
                </p>
                <p>
                  <strong className="text-gray-700">Frequency</strong> - daily, weekly, monthly,
                  quarterly, yearly
                </p>
                <p>
                  <strong className="text-gray-700">Notes</strong> - Additional notes (optional)
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
                    <TableHead className="text-gray-500 font-medium">Status</TableHead>
                    <TableHead className="text-gray-500 font-medium">Name</TableHead>
                    <TableHead className="text-gray-500 font-medium">Category</TableHead>
                    <TableHead className="text-right text-gray-500 font-medium">Amount</TableHead>
                    <TableHead className="text-gray-500 font-medium">Frequency</TableHead>
                    <TableHead className="text-right text-gray-500 font-medium">Monthly</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={!item.isValid ? 'bg-red-50' : 'border-gray-100'}
                    >
                      <TableCell>
                        {item.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-secondary" />
                        ) : (
                          <span title={item.errors.join(', ')}>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {item.name || '—'}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {categoryLabels[item.category] || item.category}
                      </TableCell>
                      <TableCell className="text-right text-gray-900">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="capitalize text-gray-500">{item.frequency}</TableCell>
                      <TableCell className="text-right font-medium text-gray-900">
                        {formatCurrency(getMonthlyAmount(item))}
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
            <Button variant="outline" className="border-gray-200 text-gray-700" asChild>
              <Link to="/dashboard/expenses">Cancel</Link>
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || validCount === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Importing...' : `Import ${validCount} Expenses`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
