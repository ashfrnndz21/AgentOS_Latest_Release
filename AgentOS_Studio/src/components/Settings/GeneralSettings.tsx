
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Moon, Sun, Upload, RotateCcw, Eye, Check, X, Image } from 'lucide-react';
import { useIndustry } from '@/contexts/IndustryContext';
import { toast } from 'sonner';

const LogoCustomization = () => {
  const { currentIndustry, setIndustry, availableIndustries } = useIndustry();
  const [logoUrl, setLogoUrl] = useState(currentIndustry.logo);
  const [previewUrl, setPreviewUrl] = useState(currentIndustry.logo);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setShowUploadOptions(false);
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

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg p-1">
            <img 
              src={previewUrl} 
              alt="Current Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://aws.amazon.com/favicon.ico';
              }}
            />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Current Logo</p>
            <p className="text-gray-400 text-xs">{currentIndustry.displayName}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUploadOptions(!showUploadOptions)}
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <Image className="h-4 w-4 mr-2" />
          Change Logo
        </Button>
      </div>

      {/* Upload Options (Collapsible) */}
      {showUploadOptions && (
        <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-white text-sm">Upload File</Label>
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
                className="w-full border-gray-600 text-white hover:bg-gray-800"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label className="text-white text-sm">Logo URL</Label>
              <div className="flex gap-1">
                <Input
                  value={logoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="bg-gray-800 border-gray-600 text-white text-sm"
                  size="sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewUrl(logoUrl)}
                  className="border-gray-600 text-white hover:bg-gray-800 px-2"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-2 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={handleReset}
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              Reset
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setLogoUrl(currentIndustry.logo);
                  setPreviewUrl(currentIndustry.logo);
                  setShowUploadOptions(false);
                }}
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="h-3 w-3 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-3 w-3 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-700">
            <p><strong>Guidelines:</strong> PNG/JPG/GIF/SVG, max 2MB, square aspect ratio preferred</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-beam-dark-accent/30 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-4 w-4 mr-2 text-blue-400" />
            General Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure application-wide settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Theme</Label>
                  <p className="text-gray-400 text-sm">Choose your preferred theme</p>
                </div>
                <Select defaultValue="dark">
                  <SelectTrigger className="w-[180px] bg-beam-dark border-gray-700 text-white">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator className="bg-gray-700/50" />
            
            {/* Logo Customization Section */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <Label className="text-white">Platform Logo</Label>
                <p className="text-gray-400 text-sm">Customize your platform logo</p>
              </div>
              <LogoCustomization />
            </div>
            
            <Separator className="bg-gray-700/50" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Notifications</Label>
                  <p className="text-gray-400 text-sm">Enable or disable app notifications</p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
            </div>
            
            <Separator className="bg-gray-700/50" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Analytics</Label>
                  <p className="text-gray-400 text-sm">Allow anonymous usage data collection</p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
            </div>
            
            <Separator className="bg-gray-700/50" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Developer Mode</Label>
                  <p className="text-gray-400 text-sm">Enable advanced features for developers</p>
                </div>
                <Switch id="developer-mode" />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button variant="default">Save Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
