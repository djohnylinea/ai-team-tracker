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

interface AddAwarenessAreaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (areaKey: string, label: string, description: string) => Promise<void>;
}

export function AddAwarenessAreaDialog({
  open,
  onClose,
  onSave,
}: AddAwarenessAreaDialogProps) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLabel('');
      setDescription('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!label.trim()) return;
    
    // Generate a key from the label (lowercase, underscored)
    const areaKey = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    setSaving(true);
    await onSave(areaKey, label.trim(), description.trim());
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#123A43' }}>Add Awareness Area</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="areaLabel">Area Name</Label>
            <Input
              id="areaLabel"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Data Privacy"
              style={{ borderColor: '#CEDADD' }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="areaDescription">Description</Label>
            <Textarea
              id="areaDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this awareness area..."
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
            disabled={!label.trim() || saving}
            style={{ backgroundColor: '#B06C50' }}
          >
            {saving ? 'Adding...' : 'Add Area'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
