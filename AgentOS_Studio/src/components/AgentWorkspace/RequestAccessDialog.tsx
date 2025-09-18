
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface RequestAccessDialogProps {
  projectName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RequestAccessDialog = ({ 
  projectName, 
  open, 
  onOpenChange 
}: RequestAccessDialogProps) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API to request access
      // For now, we'll simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Access Requested",
        description: `Your request for access to ${projectName} has been submitted. You'll be notified when access is granted.`,
      });
      
      onOpenChange(false);
      setReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-beam-dark border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Access</DialogTitle>
          <DialogDescription className="text-gray-400">
            Request access to the project: {projectName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for Access
              </label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for requesting access to this project..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-32 bg-beam-dark-accent/30 border-gray-700/50"
                required
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
