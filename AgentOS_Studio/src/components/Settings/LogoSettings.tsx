import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIndustry } from '@/contexts/IndustryContext';
import { Upload, RotateCcw, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const LogoSettings = () => {
  const { currentIndustry, setIndustry, availableIndustries } = useIndustry();
  const [logoUrl, setLogoUrl] = useState(currentIndustry.logo);
  const [previewUrl, setPreviewUrl] = useState(currentIndustry.logo);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple test to make sure component renders
  console.log('LogoSettings component rendered');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setLogoUrl(result);
        setIsUploading(false);
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error('Failed to upload logo');
    }
  };

  const handleUrlChange = (url: string) => {
    setLogoUrl(url);
    setPreviewUrl(url);
  };

  const handleSave = () => {
    // Update the current industry configuration with new logo
    const updatedIndustry = {
      ...currentIndustry,
      logo: logoUrl
    };
    
    setIndustry(updatedIndustry);
    
    // Save to localStorage for persistence
    localStorage.setItem('customLogo', logoUrl);
    localStorage.setItem('industryConfig', JSON.stringify(updatedIndustry));
    
    toast.success('Logo updated successfully!');
  };

  const handleReset = () => {
    // Find the original industry configuration
    const originalIndustry = availableIndustries.find(ind => ind.id === currentIndustry.id);
    const originalLogo = originalIndustry?.logo || 'https://aws.amazon.com/favicon.ico';
    
    setLogoUrl(originalLogo);
    setPreviewUrl(originalLogo);
    
    // Remove custom logo from localStorage
    localStorage.removeItem('customLogo');
    
    toast.info('Logo reset to default');
  };

  const handlePreview = () => {
    if (logoUrl !== previewUrl) {
      setPreviewUrl(logoUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-white p-4 bg-red-500 rounded">
        TEST: Logo Settings Component is rendering!
      </div>
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Logo Customization
          </CardTitle>
          <CardDescription className="text-gray-400">
            Customize your platform logo. Upload an image file or provide a URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Logo Preview */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg p-2">
              <img 
                src={previewUrl} 
                alt="Logo Preview" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://aws.amazon.com/favicon.ico';
                }}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-medium">Current Logo</h3>
              <p className="text-sm text-gray-400">
                {currentIndustry.displayName}
              </p>
            </div>
          </div>

          {/* Upload Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-white">Upload Image File</Label>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500">
                  Supports: PNG, JPG, GIF, SVG (Max 2MB)
                </p>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-3">
              <Label className="text-white">Logo URL</Label>
              <div className="flex gap-2">
                <Input
                  value={logoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setLogoUrl(currentIndustry.logo);
                  setPreviewUrl(currentIndustry.logo);
                }}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Guidelines */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white text-sm">Logo Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-400 space-y-1">
            <p>• <strong>Recommended size:</strong> 64x64 pixels or larger</p>
            <p>• <strong>Format:</strong> PNG with transparent background preferred</p>
            <p>• <strong>Aspect ratio:</strong> Square (1:1) works best</p>
            <p>• <strong>File size:</strong> Maximum 2MB</p>
            <p>• <strong>Colors:</strong> High contrast logos work best on dark backgrounds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};