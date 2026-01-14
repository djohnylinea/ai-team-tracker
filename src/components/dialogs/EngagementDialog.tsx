'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Engagement } from '@/lib/data';

interface EngagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagement?: Engagement | null;
  onSave: (engagement: Omit<Engagement, 'id'>) => Promise<void>;
}

export function EngagementDialog({ open, onOpenChange, engagement, onSave }: EngagementDialogProps) {
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allocationPercent, setAllocationPercent] = useState(100);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!engagement;

  // Reset form when dialog opens/closes or engagement changes
  useEffect(() => {
    if (open) {
      if (engagement) {
        setClient(engagement.client);
        setStartDate(engagement.startDate);
        setEndDate(engagement.endDate || '');
        setAllocationPercent(engagement.allocationPercent);
      } else {
        setClient('');
        setStartDate('');
        setEndDate('');
        setAllocationPercent(100);
      }
    }
  }, [open, engagement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!client.trim() || !startDate) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        client: client.trim(),
        startDate,
        endDate: endDate || null,
        allocationPercent,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving engagement:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Engagement' : 'Add New Engagement'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the engagement details below.'
                : 'Enter the details for the new engagement.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client Name *</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allocationPercent">Allocation %</Label>
              <Input
                id="allocationPercent"
                type="number"
                min={0}
                max={100}
                value={allocationPercent}
                onChange={(e) => setAllocationPercent(Number(e.target.value))}
              />
              <p className="text-sm text-gray-500">
                Percentage of time allocated to this engagement
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !client.trim() || !startDate}>
              {saving ? 'Saving...' : isEditMode ? 'Update' : 'Add Engagement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
