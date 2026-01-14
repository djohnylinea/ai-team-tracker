'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type TimeOff, type TimeOffType, TIME_OFF_TYPES } from '@/lib/data';

interface TimeOffDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    startDate: string;
    endDate: string;
    type: TimeOffType;
    notes: string;
  }) => Promise<void>;
  timeOff?: TimeOff | null;
}

export function TimeOffDialog({
  open,
  onClose,
  onSave,
  timeOff,
}: TimeOffDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<TimeOffType>('Vacation');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = !!timeOff;

  useEffect(() => {
    if (open) {
      if (timeOff) {
        setStartDate(timeOff.startDate);
        setEndDate(timeOff.endDate);
        setType(timeOff.type as TimeOffType);
        setNotes(timeOff.notes || '');
      } else {
        // Default to today for new entries
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setType('Vacation');
        setNotes('');
      }
    }
  }, [open, timeOff]);

  const handleSave = async () => {
    if (!startDate || !endDate) return;
    
    setSaving(true);
    await onSave({
      startDate,
      endDate,
      type,
      notes,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#123A43' }}>
            {isEdit ? 'Edit Time Off' : 'Add Time Off'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ borderColor: '#CEDADD' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                style={{ borderColor: '#CEDADD' }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as TimeOffType)}>
              <SelectTrigger style={{ borderColor: '#CEDADD' }}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OFF_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: t.color }} 
                      />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              style={{ borderColor: '#CEDADD' }}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!startDate || !endDate || saving}
            style={{ backgroundColor: '#B06C50' }}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Time Off'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
