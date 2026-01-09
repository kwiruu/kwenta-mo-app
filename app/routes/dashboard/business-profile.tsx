import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building2, MapPin, Users, DollarSign, Package, Save, Edit, Lock } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useUserProfile, useUpdateBusiness } from '~/hooks/useBusiness';
import { useBusinessStore } from '~/stores/businessStore';
import { APP_CONFIG } from '~/config/app';
import type { BusinessType } from '~/types';

export function meta() {
  return [
    { title: `Business Profile - ${APP_CONFIG.name}` },
    { name: 'description', content: 'Set up your business profile' },
  ];
}

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: 'carinderia', label: 'Carinderia' },
  { value: 'food_stall', label: 'Food Stall' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'catering', label: 'Catering' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'other', label: 'Other' },
];

const rawMaterialSources = [
  { value: 'market', label: 'Local Market (Palengke)' },
  { value: 'supplier', label: 'Direct Supplier' },
  { value: 'own_farm', label: 'Own Farm/Garden' },
  { value: 'mixed', label: 'Mixed Sources' },
];

export default function BusinessProfilePage() {
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile();
  const updateBusinessMutation = useUpdateBusiness();

  const business = profile?.business;
  const [isEditing, setIsEditing] = useState(!business); // Auto-edit if no business
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: '' as BusinessType,
    location: '',
    employeeCount: '',
    avgMonthlySales: '',
    rawMaterialSource: '',
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.businessName || '',
        type: (business.businessType || '') as BusinessType,
        location: business.address || '',
        employeeCount: business.employeeCount?.toString() || '',
        avgMonthlySales: business.avgMonthlySales?.toString() || '',
        rawMaterialSource: business.rawMaterialSource || '',
      });
      setIsEditing(false);
    } else if (!isLoadingProfile) {
      setIsEditing(true);
    }
  }, [business, isLoadingProfile]);

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current business data
    setFormData({
      name: business?.businessName || '',
      type: (business?.businessType || '') as BusinessType,
      location: business?.address || '',
      employeeCount: business?.employeeCount?.toString() || '',
      avgMonthlySales: business?.avgMonthlySales?.toString() || '',
      rawMaterialSource: business?.rawMaterialSource || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const result = await updateBusinessMutation.mutateAsync({
        businessName: formData.name,
        businessType: formData.type,
        address: formData.location,
        employeeCount: parseInt(formData.employeeCount) || undefined,
        avgMonthlySales: parseFloat(formData.avgMonthlySales) || undefined,
        rawMaterialSource: formData.rawMaterialSource || undefined,
      });

      setSuccess(true);
      setIsEditing(false);

      // If first time setup, redirect to dashboard
      if (!business) {
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Error saving business profile:', error);
    }
  };

  const isLoading = updateBusinessMutation.isPending;

  if (isLoadingProfile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Business Profile</h1>
        <p className="text-gray-500 mt-1">
          Set up your business information for accurate costing calculations.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-lightgreenz/10 border border-secondary/20 rounded-lg">
          <p className="text-greenz font-medium">✓ Business profile saved successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="border shadow-none bg-white border-none">
          <CardContent className="space-y-6 p-0">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Business Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Lola's Carinderia"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-200 focus:border-primary focus:ring-primary disabled:opacity-60 disabled:bg-black/5 disabled:cursor-not-allowed"
                disabled={!isEditing}
                required
              />
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700">
                Business Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as BusinessType })}
                disabled={!isEditing}
              >
                <SelectTrigger className="disabled:opacity-60 disabled:bg-black/5 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-primary" />
                Business Location *
              </Label>
              <Textarea
                id="location"
                placeholder="e.g., Barangay Lahug, Cebu City"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="border-gray-200 focus:border-primary focus:ring-primary disabled:opacity-60 disabled:bg-black/5 disabled:cursor-not-allowed"
                disabled={!isEditing}
                required
              />
              <p className="text-xs text-gray-400">Enter your complete business address</p>
            </div>

            {/* Employee Count */}
            <div className="space-y-2">
              <Label htmlFor="employeeCount" className="flex items-center gap-2 text-gray-700">
                <Users className="h-4 w-4 text-primary" />
                Number of Employees *
              </Label>
              <Input
                id="employeeCount"
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                className="border-gray-200 focus:border-primary focus:ring-primary disabled:opacity-60 disabled:bg-black/5 disabled:cursor-not-allowed"
                disabled={!isEditing}
                required
              />
              <p className="text-xs text-gray-400">Include yourself if you work in the business</p>
            </div>

            {/* Average Monthly Sales */}
            <div className="space-y-2">
              <Label htmlFor="avgMonthlySales" className="flex items-center gap-2 text-gray-700">
                <DollarSign className="h-4 w-4 text-primary" />
                Average Monthly Sales (₱) *
              </Label>
              <Input
                id="avgMonthlySales"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 50000"
                value={formData.avgMonthlySales}
                onChange={(e) => setFormData({ ...formData, avgMonthlySales: e.target.value })}
                className="border-gray-200 focus:border-primary focus:ring-primary disabled:opacity-60 disabled:bg-black/5 disabled:cursor-not-allowed"
                disabled={!isEditing}
                required
              />
              <p className="text-xs text-gray-400">
                Estimate based on your typical monthly revenue
              </p>
            </div>

            {/* Source of Raw Materials */}
            <div className="space-y-2">
              <Label htmlFor="rawMaterialSource" className="flex items-center gap-2 text-gray-700">
                <Package className="h-4 w-4 text-primary" />
                Source of Raw Materials *
              </Label>
              <Select
                value={formData.rawMaterialSource}
                onValueChange={(value) => setFormData({ ...formData, rawMaterialSource: value })}
                disabled={!isEditing}
              >
                <SelectTrigger className="border-gray-200 disabled:opacity-60 disabled:bg-black/5 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Where do you get your ingredients?" />
                </SelectTrigger>
                <SelectContent>
                  {rawMaterialSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          {isEditing ? (
            <>
              {business && (
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  size="lg"
                  variant="outline"
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading} size="lg" variant="green">
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Business Profile
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={handleEdit}
              size="lg"
              variant="outline"
              className="border-greenz text-greenz hover:bg-greenz hover:text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Business Profile
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
