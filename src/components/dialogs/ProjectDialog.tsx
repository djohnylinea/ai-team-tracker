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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project } from '@/lib/data';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null; // null = add mode, Project = edit mode
  onSave: (project: Omit<Project, 'id'>) => Promise<void>;
}

const PROJECT_TYPES = [
  { value: 'AI Use Case', label: 'AI Use Case' },
  { value: 'AI Community Center', label: 'AI Community Center' },
  { value: 'Other AI Initiative', label: 'Other AI Initiative' },
];

const REUSE_POTENTIALS = [
  { value: 'Internal', label: 'Internal' },
  { value: 'External', label: 'External' },
];

const PROJECT_STATUSES = [
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
];

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('AI Use Case');
  const [source, setSource] = useState('');
  const [reusable, setReusable] = useState<string>('Internal');
  const [status, setStatus] = useState<string>('Active');
  const [saving, setSaving] = useState(false);

  const isEditMode = !!project;

  // Reset form when dialog opens/closes or project changes
  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name);
        setType(project.type);
        setSource(project.source || '');
        setReusable(project.reusable);
        setStatus(project.status);
      } else {
        setName('');
        setType('AI Use Case');
        setSource('');
        setReusable('Internal');
        setStatus('Active');
      }
    }
  }, [open, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !source.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type: type as Project['type'],
        source: source.trim(),
        reusable: reusable as Project['reusable'],
        status: status as Project['status'],
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the project details below.'
                : 'Enter the details for the new project.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., GitHub, Internal, Client"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reusable">Reuse Potential</Label>
                <Select value={reusable} onValueChange={setReusable}>
                  <SelectTrigger id="reusable">
                    <SelectValue placeholder="Select potential" />
                  </SelectTrigger>
                  <SelectContent>
                    {REUSE_POTENTIALS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Button type="submit" disabled={saving || !name.trim() || !source.trim()}>
              {saving ? 'Saving...' : isEditMode ? 'Update' : 'Add Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
