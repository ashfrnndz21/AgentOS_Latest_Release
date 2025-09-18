
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CampaignType } from './types';
import { toast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(3, { message: "Campaign name must be at least 3 characters" }),
  type: z.string(),
  target: z.string(),
  targetSize: z.number().positive(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.string().default('Draft'),
});

type FormValues = z.infer<typeof formSchema>;

interface CampaignDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editCampaign?: CampaignType;
  onSave: (campaign: Partial<CampaignType>) => void;
}

export const CampaignDialog = ({ open, setOpen, editCampaign, onSave }: CampaignDialogProps) => {
  const isEditing = !!editCampaign;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editCampaign?.name || '',
      type: editCampaign?.type || 'Upsell',
      target: editCampaign?.target || 'Medium Value',
      targetSize: editCampaign?.targetSize || 100000,
      startDate: editCampaign?.startDate ? new Date(editCampaign.startDate) : new Date(),
      endDate: editCampaign?.endDate ? new Date(editCampaign.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: editCampaign?.status || 'Draft',
    },
  });

  const handleSubmit = (values: FormValues) => {
    const campaignData: Partial<CampaignType> = {
      ...values,
      id: editCampaign?.id || `C${Math.floor(1000 + Math.random() * 9000)}`,
      startDate: format(values.startDate, 'yyyy-MM-dd'),
      endDate: format(values.endDate, 'yyyy-MM-dd'),
      conversion: editCampaign?.conversion || 0,
      roi: editCampaign?.roi || 0,
      revenue: editCampaign?.revenue || 0,
      cost: editCampaign?.cost || 0,
    };
    
    onSave(campaignData);
    setOpen(false);
    toast({
      title: isEditing ? "Campaign Updated" : "Campaign Created",
      description: `${values.name} has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-beam-dark text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">{isEditing ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing 
              ? 'Update the campaign details below.' 
              : 'Fill out the form below to create a new marketing campaign.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Campaign Name</FormLabel>
                  <FormControl>
                    <Input className="bg-beam-dark-accent/50 border-gray-700 text-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-beam-dark-accent/50 border-gray-700 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-beam-dark border-gray-700">
                        <SelectItem value="Upsell">Upsell</SelectItem>
                        <SelectItem value="Cross-sell">Cross-sell</SelectItem>
                        <SelectItem value="Retention">Retention</SelectItem>
                        <SelectItem value="Acquisition">Acquisition</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Target Segment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-beam-dark-accent/50 border-gray-700 text-white">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-beam-dark border-gray-700">
                        <SelectItem value="High Value">High Value</SelectItem>
                        <SelectItem value="Medium Value">Medium Value</SelectItem>
                        <SelectItem value="Low Value">Low Value</SelectItem>
                        <SelectItem value="New Customers">New Customers</SelectItem>
                        <SelectItem value="At Risk">At Risk</SelectItem>
                        <SelectItem value="All Segments">All Segments</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Target Size</FormLabel>
                  <FormControl>
                    <Input 
                      className="bg-beam-dark-accent/50 border-gray-700 text-white" 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "bg-beam-dark-accent/50 border-gray-700 text-white pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-beam-dark border-gray-700" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "bg-beam-dark-accent/50 border-gray-700 text-white pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-beam-dark border-gray-700" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-beam-dark-accent/50 border-gray-700 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-beam-dark border-gray-700">
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-beam-blue hover:bg-blue-600" type="submit">
                {isEditing ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
