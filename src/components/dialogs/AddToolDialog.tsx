'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TOOL_CATEGORIES } from '@/types';

interface AddToolDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (toolName: string, categoryKey: string) => Promise<void>;
  defaultCategory?: string;
}

export function AddToolDialog({ open, onClose, onSave, defaultCategory }: AddToolDialogProps) {
  const [toolName, setToolName] = useState('');
  const [categoryKey, setCategoryKey] = useState(defaultCategory || TOOL_CATEGORIES[0].key);
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setToolName('');
      setCategoryKey(defaultCategory || TOOL_CATEGORIES[0].key);
    }
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim()) return;

    setSaving(true);
    await onSave(toolName.trim(), categoryKey);
    setSaving(false);
    setToolName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Tool</DialogTitle>
            <DialogDescription>
              Add a new tool to the shared catalog. All team members will see this tool.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="toolName">Tool Name *</Label>
              <Input
                id="toolName"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="e.g., Microsoft Copilot"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryKey} onValueChange={setCategoryKey}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOOL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!toolName.trim() || saving}
              style={{ backgroundColor: '#B06C50' }}
            >
              {saving ? 'Adding...' : 'Add Tool'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
