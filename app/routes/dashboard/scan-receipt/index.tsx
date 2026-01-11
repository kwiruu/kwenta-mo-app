import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import {
  Upload,
  FileImage,
  Loader2,
  Package,
  Receipt,
  HelpCircle,
  Trash2,
  Check,
  X,
  RefreshCw,
  Store,
  Brain,
  FileQuestionMark,
  Calendar,
  FileText,
  Camera,
  Crop,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { useToast } from '~/hooks/use-toast';
import {
  useScanReceipt,
  useSaveScannedItems,
  useLearnFromCorrections,
} from '~/hooks/useReceiptScanner';
import { useInventoryPeriods, useSetActivePeriod } from '~/hooks/useInventory';
import type {
  ScannedItem,
  ItemCategory,
  SaveInventoryItem,
  SaveExpenseItem,
  VendorInfo,
  BillInfo,
  DocumentType,
  TotalValidation,
  CategoryCorrection,
} from '~/lib/api';

// Extended scanned item with editable fields
interface EditableScannedItem extends ScannedItem {
  id: string;
  inventoryType?: string;
  expenseCategory?: string;
  expenseFrequency?: string;
  originalCategory?: ItemCategory; // Track original for learning
  notes?: string;
  periodId?: number;
}

const INVENTORY_TYPES = [
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'INGREDIENT', label: 'Ingredient' },
  { value: 'SPICE', label: 'Spice' },
  { value: 'CONDIMENT', label: 'Condiment' },
  { value: 'BEVERAGE', label: 'Beverage' },
  { value: 'DAIRY', label: 'Dairy' },
  { value: 'PRODUCE', label: 'Produce' },
  { value: 'PROTEIN', label: 'Protein' },
  { value: 'GRAIN', label: 'Grain' },
  { value: 'OIL', label: 'Oil' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'SUPPLY', label: 'Supply' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'OTHER', label: 'Other' },
];

const EXPENSE_CATEGORIES = [
  { value: 'ELECTRICITY', label: 'Electricity' },
  { value: 'WATER', label: 'Water' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'GAS', label: 'Gas' },
  { value: 'UTILITIES', label: 'Utilities (General)' },
  { value: 'RENT', label: 'Rent' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'SUPPLIES', label: 'Supplies' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'SALARY', label: 'Salary/Labor' },
  { value: 'OTHER', label: 'Other' },
];

const EXPENSE_FREQUENCIES = [
  { value: 'ONE_TIME', label: 'One Time' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export default function ScanReceiptPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState<EditableScannedItem[]>([]);
  const [activeTab, setActiveTab] = useState<ItemCategory>('INVENTORY');
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | undefined>();
  const [_billInfo, setBillInfo] = useState<BillInfo | undefined>();
  const [documentType, setDocumentType] = useState<DocumentType>('RECEIPT');
  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [_totalValidation, setTotalValidation] = useState<TotalValidation | undefined>();
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 300, height: 400 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);

  // Mutations
  const scanMutation = useScanReceipt();
  const saveMutation = useSaveScannedItems();
  const learnMutation = useLearnFromCorrections();

  // Periods
  const { data: allPeriods } = useInventoryPeriods();
  const activePeriod = allPeriods?.find((p: { isActive: boolean }) => p.isActive);
  const setActivePeriodMutation = useSetActivePeriod();

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Handle scan
  const handleScan = async () => {
    if (!selectedFile) return;

    try {
      const result = await scanMutation.mutateAsync(selectedFile);

      // Store vendor, bill info, and validation info
      setVendorInfo(result.vendor);
      setBillInfo(result.billInfo);
      setDocumentType(result.documentType || 'RECEIPT');
      setTotalValidation(result.totalValidation);

      // Determine the default expense frequency based on document type
      const defaultFrequency =
        result.documentType === 'UTILITY_BILL' || result.documentType === 'RENT_BILL'
          ? 'MONTHLY'
          : 'ONE_TIME';

      // Convert to editable items with IDs
      const editableItems: EditableScannedItem[] = result.items.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        inventoryType: item.inventoryType || 'RAW_MATERIAL',
        expenseCategory: item.expenseType || 'OTHER',
        expenseFrequency: defaultFrequency,
        originalCategory: item.category, // Track for learning
      }));

      setItems(editableItems);
      // For bills, default to showing expenses tab
      if (result.documentType === 'UTILITY_BILL' || result.documentType === 'RENT_BILL') {
        setActiveTab('EXPENSE');
      }
      setStep('review');

      // Build appropriate message based on document type
      const docTypeMsg =
        result.documentType === 'UTILITY_BILL'
          ? 'Utility bill'
          : result.documentType === 'RENT_BILL'
            ? 'Rent bill'
            : 'Receipt';
      const vendorMsg = result.vendor?.name ? ` from ${result.vendor.name}` : '';
      toast({
        title: `${docTypeMsg} scanned!`,
        description: `Found ${result.items.length} items${vendorMsg} (${result.inventoryCount} inventory, ${result.expenseCount} expenses, ${result.unknownCount} needs review)`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Scan failed',
        description: error instanceof Error ? error.message : 'Failed to scan receipt',
      });
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setCameraStream(stream);
      setShowCamera(true);

      // Wait for next tick to ensure modal is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Explicitly play the video
          videoRef.current.play().catch((err) => {
            console.error('Video play failed:', err);
            toast({
              variant: 'destructive',
              title: 'Camera error',
              description: 'Failed to start video stream',
            });
          });
        }
      }, 100);
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        variant: 'destructive',
        title: 'Camera access denied',
        description: 'Please allow camera access to take photos',
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);

      // Get image URL for cropping
      const imageUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImageUrl(imageUrl);

      // Set initial crop area (centered, covering most of the image)
      const cropWidth = Math.min(canvas.width * 0.8, 600);
      const cropHeight = Math.min(canvas.height * 0.9, 800);
      setCropArea({
        x: (canvas.width - cropWidth) / 2,
        y: (canvas.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });

      stopCamera();
      setShowCropModal(true);
    }
  };

  const applyCrop = () => {
    if (!cropImageRef.current || !cropCanvasRef.current || !capturedImageUrl) return;

    const img = cropImageRef.current;
    const canvas = cropCanvasRef.current;

    // Calculate scale between displayed image and actual image
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Apply scale to crop area
    const scaledCrop = {
      x: cropArea.x * scaleX,
      y: cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY,
    };

    canvas.width = scaledCrop.width;
    canvas.height = scaledCrop.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        img,
        scaledCrop.x,
        scaledCrop.y,
        scaledCrop.width,
        scaledCrop.height,
        0,
        0,
        scaledCrop.width,
        scaledCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setShowCropModal(false);
            setCapturedImageUrl(null);
            toast({
              title: 'Photo cropped!',
              description: 'Click "Scan Image" to process the receipt',
            });
          }
        },
        'image/jpeg',
        0.95
      );
    }
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setCapturedImageUrl(null);
    setShowCamera(true);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
    };
  }, [cameraStream]);

  // Move item to different category
  const moveItem = (itemId: string, newCategory: ItemCategory) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, category: newCategory } : item))
    );
  };

  // Update item field
  const updateItem = (itemId: string, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Get items by category
  const getItemsByCategory = (category: ItemCategory) =>
    items.filter((item) => item.category === category);

  // Collect corrections for learning (items where category changed)
  const getCorrections = (): CategoryCorrection[] => {
    return items
      .filter(
        (item) =>
          item.originalCategory !== item.category ||
          (item.category === 'INVENTORY' && item.inventoryType) ||
          (item.category === 'EXPENSE' && item.expenseCategory)
      )
      .map((item) => ({
        itemName: item.name,
        category: item.category,
        subCategory:
          item.category === 'INVENTORY'
            ? item.inventoryType
            : item.category === 'EXPENSE'
              ? item.expenseCategory
              : undefined,
        vendor: vendorInfo?.name,
      }));
  };

  // Handle save
  const handleSave = async () => {
    const inventoryItems: SaveInventoryItem[] = getItemsByCategory('INVENTORY').map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitCost: item.unitCost,
      totalCost: item.totalCost,
      inventoryType: item.inventoryType || 'RAW_MATERIAL',
      purchaseDate: purchaseDate,
      notes: item.notes,
      periodId: item.periodId || activePeriod?.id,
      supplier: vendorInfo?.name,
    }));

    const expenseItems: SaveExpenseItem[] = getItemsByCategory('EXPENSE').map((item) => ({
      name: item.name,
      amount: item.totalCost,
      category: item.expenseCategory || 'OTHER',
      frequency: item.expenseFrequency || 'ONE_TIME',
      date: purchaseDate,
    }));

    if (inventoryItems.length === 0 && expenseItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nothing to save',
        description: 'Please categorize at least one item before saving',
      });
      return;
    }

    try {
      // Save items with vendor info
      const result = await saveMutation.mutateAsync({
        inventoryItems,
        expenseItems,
        vendor: vendorInfo, // Include edited vendor info
        purchaseDate, // Include purchase date
      });

      // Learn from corrections (fire and forget)
      const corrections = getCorrections();
      if (corrections.length > 0) {
        learnMutation.mutate(corrections);
      }

      toast({
        title: 'Items saved!',
        description: `Saved ${result.inventorySaved} inventory items and ${result.expensesSaved} expenses${corrections.length > 0 ? `. Learning from ${corrections.length} categorizations.` : ''}`,
      });

      // Navigate back to inventory
      navigate('/dashboard/inventory');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save items',
      });
    }
  };

  // Reset scanner
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setItems([]);
    setStep('upload');
    setVendorInfo(undefined);
    setBillInfo(undefined);
    setDocumentType('RECEIPT');
    setTotalValidation(undefined);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setActiveTab('INVENTORY');
    scanMutation.reset();
  };

  // Render item row
  const renderItemRow = (item: EditableScannedItem) => (
    <TableRow key={item.id}>
      <TableCell>
        <Input
          value={item.name}
          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
          className="min-w-[150px]"
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
            className="w-16"
          />
          <Input
            value={item.unit}
            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
            className="w-16"
          />
        </div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.unitCost}
          onChange={(e) => updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
          className="w-24"
          step="0.01"
        />
      </TableCell>
      <TableCell className="font-medium">₱{item.totalCost.toFixed(2)}</TableCell>
      {item.category === 'INVENTORY' && (
        <TableCell>
          <Select
            value={item.inventoryType}
            onValueChange={(v) => updateItem(item.id, 'inventoryType', v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVENTORY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      )}
      {item.category === 'EXPENSE' && (
        <>
          <TableCell>
            <Select
              value={item.expenseCategory}
              onValueChange={(v) => updateItem(item.id, 'expenseCategory', v)}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <Select
              value={item.expenseFrequency}
              onValueChange={(v) => updateItem(item.id, 'expenseFrequency', v)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
        </>
      )}
      <TableCell>
        <div className="flex gap-1">
          {item.category !== 'INVENTORY' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveItem(item.id, 'INVENTORY')}
              title="Move to Inventory"
            >
              <Package className="h-4 w-4" />
            </Button>
          )}
          {item.category !== 'EXPENSE' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveItem(item.id, 'EXPENSE')}
              title="Move to Expenses"
            >
              <Receipt className="h-4 w-4" />
            </Button>
          )}
          {item.category !== 'UNKNOWN' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveItem(item.id, 'UNKNOWN')}
              title="Move to Review"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
          {item.category === 'INVENTORY' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingNotesItemId(item.id);
                setTempNote(item.notes || '');
              }}
              title="Add/Edit Note"
              className="hover:text-blue-600"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteItem(item.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scan Receipt or Bill</h1>
          <p className="text-muted-foreground">
            Upload receipts, utility bills (electricity, water, internet), or rent bills
          </p>
        </div>
      </div>

      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Drag and drop a receipt or bill image, or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="max-h-64 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="p-4 rounded-full bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {selectedFile ? (
                    <div className="text-sm">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>Supports: JPG, PNG, WebP</p>
                      <p>Max size: 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1"
                  onClick={handleScan}
                  disabled={!selectedFile || scanMutation.isPending}
                >
                  {scanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <FileImage className="mr-2 h-4 w-4" />
                      Scan Image
                    </>
                  )}
                </Button>
                <Button className="w-1/2" variant="outline" onClick={startCamera}>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                {selectedFile && (
                  <Button variant="outline" onClick={handleReset}>
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Good lighting</p>
                  <p className="text-sm text-muted-foreground">
                    Take photos in well-lit areas for clearer text
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Flat surface</p>
                  <p className="text-sm text-muted-foreground">
                    Place receipt on a flat surface to avoid distortion
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Clear focus</p>
                  <p className="text-sm text-muted-foreground">
                    Make sure the text is in focus and readable
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <X className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Avoid shadows</p>
                  <p className="text-sm text-muted-foreground">
                    Shadows can make text harder to read
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <FileQuestionMark className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Review receipt</p>
                  <p className="text-sm text-muted-foreground">
                    Review the extracted items for accuracy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="relative w-full h-full flex flex-col">
            {/* Camera View */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={stopCamera}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="bg-white text-black hover:bg-gray-200 px-8"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Capture
                </Button>
              </div>
              <p className="text-center text-white/80 text-sm mt-4">
                Position the receipt in frame and tap Capture
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && capturedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <div className="relative inline-block">
              {/* Captured image */}
              <img
                ref={cropImageRef}
                src={capturedImageUrl}
                alt="Captured"
                className="max-w-full max-h-[70vh] object-contain"
                onLoad={() => {
                  if (cropImageRef.current) {
                    // Adjust crop area to image size
                    const imgWidth = cropImageRef.current.width;
                    const imgHeight = cropImageRef.current.height;
                    const cropWidth = Math.min(imgWidth * 0.8, 600);
                    const cropHeight = Math.min(imgHeight * 0.9, 800);
                    setCropArea({
                      x: (imgWidth - cropWidth) / 2,
                      y: (imgHeight - cropHeight) / 2,
                      width: cropWidth,
                      height: cropHeight,
                    });
                  }
                }}
              />

              {/* Crop overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Darkened area outside crop */}
                <div
                  className="absolute inset-0 bg-black/50"
                  style={{
                    clipPath: `polygon(
                    0% 0%, 0% 100%, 100% 100%, 100% 0%,
                    0% 0%, ${cropArea.x}px ${cropArea.y}px,
                    ${cropArea.x + cropArea.width}px ${cropArea.y}px,
                    ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px,
                    ${cropArea.x}px ${cropArea.y + cropArea.height}px,
                    ${cropArea.x}px ${cropArea.y}px
                  )`,
                  }}
                />

                {/* Crop frame */}
                <div
                  className="absolute border-2 border-green-500 pointer-events-auto"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                  }}
                >
                  {/* Corner handles */}
                  <div
                    className="absolute -left-2 -top-2 w-4 h-4 bg-green-500 rounded-full cursor-nw-resize"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startCrop = { ...cropArea };

                      const handleMove = (e: MouseEvent) => {
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;
                        setCropArea({
                          x: Math.max(0, startCrop.x + dx),
                          y: Math.max(0, startCrop.y + dy),
                          width: Math.max(100, startCrop.width - dx),
                          height: Math.max(100, startCrop.height - dy),
                        });
                      };

                      const handleUp = () => {
                        document.removeEventListener('mousemove', handleMove);
                        document.removeEventListener('mouseup', handleUp);
                      };

                      document.addEventListener('mousemove', handleMove);
                      document.addEventListener('mouseup', handleUp);
                    }}
                  />
                  <div
                    className="absolute -right-2 -top-2 w-4 h-4 bg-green-500 rounded-full cursor-ne-resize"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startCrop = { ...cropArea };

                      const handleMove = (e: MouseEvent) => {
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;
                        setCropArea({
                          x: startCrop.x,
                          y: Math.max(0, startCrop.y + dy),
                          width: Math.max(100, startCrop.width + dx),
                          height: Math.max(100, startCrop.height - dy),
                        });
                      };

                      const handleUp = () => {
                        document.removeEventListener('mousemove', handleMove);
                        document.removeEventListener('mouseup', handleUp);
                      };

                      document.addEventListener('mousemove', handleMove);
                      document.addEventListener('mouseup', handleUp);
                    }}
                  />
                  <div
                    className="absolute -left-2 -bottom-2 w-4 h-4 bg-green-500 rounded-full cursor-sw-resize"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startCrop = { ...cropArea };

                      const handleMove = (e: MouseEvent) => {
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;
                        setCropArea({
                          x: Math.max(0, startCrop.x + dx),
                          y: startCrop.y,
                          width: Math.max(100, startCrop.width - dx),
                          height: Math.max(100, startCrop.height + dy),
                        });
                      };

                      const handleUp = () => {
                        document.removeEventListener('mousemove', handleMove);
                        document.removeEventListener('mouseup', handleUp);
                      };

                      document.addEventListener('mousemove', handleMove);
                      document.addEventListener('mouseup', handleUp);
                    }}
                  />
                  <div
                    className="absolute -right-2 -bottom-2 w-4 h-4 bg-green-500 rounded-full cursor-se-resize"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startCrop = { ...cropArea };

                      const handleMove = (e: MouseEvent) => {
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;
                        setCropArea({
                          x: startCrop.x,
                          y: startCrop.y,
                          width: Math.max(100, startCrop.width + dx),
                          height: Math.max(100, startCrop.height + dy),
                        });
                      };

                      const handleUp = () => {
                        document.removeEventListener('mousemove', handleMove);
                        document.removeEventListener('mouseup', handleUp);
                      };

                      document.addEventListener('mousemove', handleMove);
                      document.addEventListener('mouseup', handleUp);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Hidden canvas for cropping */}
            <canvas ref={cropCanvasRef} className="hidden" />

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={cancelCrop}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5 mr-2" />
                Retake
              </Button>
              <Button
                size="lg"
                onClick={applyCrop}
                className="bg-green-600 text-white hover:bg-green-700 px-8"
              >
                <Crop className="h-5 w-5 mr-2" />
                Apply Crop
              </Button>
            </div>
            <p className="text-center text-white/80 text-sm mt-4">
              Drag the corners to adjust the crop area
            </p>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          {/* Vendor Info & Total Validation */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Vendor/Provider Info Card - Always show, allow manual entry */}
            <Card className="md:col-span-1">
              <CardHeader className="pt-4 pb-1">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    {documentType === 'UTILITY_BILL' || documentType === 'RENT_BILL'
                      ? 'Provider'
                      : 'Store'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      if (!vendorInfo) {
                        setVendorInfo({ name: '', address: '', phone: '', tin: '' });
                      }
                      setIsEditingVendor(!isEditingVendor);
                    }}
                  >
                    {isEditingVendor ? 'Done' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div>
                  <input
                    type="text"
                    className="w-full rounded border px-2 py-1 text-sm disabled:text-gray-500 disabled:bg-gray-50"
                    placeholder={
                      documentType === 'UTILITY_BILL' ? 'Provider name' : 'Enter store name'
                    }
                    value={vendorInfo?.name || ''}
                    disabled={!isEditingVendor}
                    onChange={(e) => setVendorInfo({ ...(vendorInfo || {}), name: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Purchase/Bill Date Card */}
            <Card className="md:col-span-1">
              <CardHeader className="pt-4 pb-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {documentType === 'UTILITY_BILL' || documentType === 'RENT_BILL'
                    ? 'Expense Date'
                    : 'Purchase Date'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <input
                  type="date"
                  className="w-full rounded border px-2 py-1 text-sm"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Receipt Preview Button */}
            {previewUrl && (
              <Card className="md:col-span-1">
                <CardHeader className="pt-4 pb-1">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileImage className="h-4 w-4" />
                    Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setShowImageModal(true)}
                  >
                    View Receipt Image
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Image Modal */}
          {showImageModal && previewUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setShowImageModal(false)}
            >
              <div
                className="relative max-h-[90vh] max-w-[90vw] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setShowImageModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={previewUrl}
                  alt="Receipt"
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '90vh' }}
                />
              </div>
            </div>
          )}

          {/* Learning indicator */}
          {items.some((item) => item.matchedWith?.startsWith('learned:')) && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>Smart Categorization Active</AlertTitle>
              <AlertDescription>
                Some items were categorized based on your previous corrections. The system learns
                from your changes!
              </AlertDescription>
            </Alert>
          )}

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ItemCategory)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="INVENTORY" className="gap-2">
                  <Package className="h-4 w-4" />
                  Inventory ({getItemsByCategory('INVENTORY').length})
                </TabsTrigger>
                <TabsTrigger value="EXPENSE" className="gap-2">
                  <Receipt className="h-4 w-4" />
                  Expenses ({getItemsByCategory('EXPENSE').length})
                </TabsTrigger>
                <TabsTrigger value="UNKNOWN" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Needs Review ({getItemsByCategory('UNKNOWN').length})
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Scan Another
                </Button>
              </div>
            </div>

            {/* Inventory Tab */}
            <TabsContent value="INVENTORY">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Inventory Items
                      </CardTitle>
                      <CardDescription>
                        These items will be added to your inventory/purchases
                      </CardDescription>
                    </div>
                    {allPeriods && allPeriods.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Period:</span>
                        <Select
                          value={activePeriod?.id}
                          onValueChange={(value) => {
                            setActivePeriodMutation.mutate(value);
                          }}
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allPeriods.map((period) => (
                              <SelectItem key={period.id} value={period.id}>
                                {period.periodName}
                                {period.isActive && ' (Active)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {getItemsByCategory('INVENTORY').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No inventory items detected. Move items here from other tabs.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{getItemsByCategory('INVENTORY').map(renderItemRow)}</TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="EXPENSE">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Operating Expenses
                  </CardTitle>
                  <CardDescription>These items will be added as operating expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {getItemsByCategory('EXPENSE').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No expenses detected. Move items here from other tabs.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{getItemsByCategory('EXPENSE').map(renderItemRow)}</TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Needs Review Tab */}
            <TabsContent value="UNKNOWN">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Needs Review
                  </CardTitle>
                  <CardDescription>
                    These items couldn't be automatically categorized. Please review and move them.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getItemsByCategory('UNKNOWN').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      All items have been categorized!
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>{getItemsByCategory('UNKNOWN').map(renderItemRow)}</TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary & Save */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {getItemsByCategory('INVENTORY').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Inventory Items</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {getItemsByCategory('EXPENSE').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {getItemsByCategory('UNKNOWN').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Needs Review</p>
                  </div>
                  <div className="border-l pl-6 text-center">
                    <p className="text-2xl font-bold">
                      ₱{items.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/dashboard/inventory')}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      saveMutation.isPending ||
                      (getItemsByCategory('INVENTORY').length === 0 &&
                        getItemsByCategory('EXPENSE').length === 0)
                    }
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save All Items
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notes Modal */}
      <Dialog
        open={editingNotesItemId !== null}
        onOpenChange={(open) => !open && setEditingNotesItemId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add/Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Note</label>
              <Textarea
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="Add any notes about this item..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNotesItemId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingNotesItemId) {
                  updateItem(editingNotesItemId, 'notes', tempNote);
                  setEditingNotesItemId(null);
                }
              }}
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
