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
import { type TeamMemberData } from '@/lib/data';

interface TeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (member: Omit<TeamMemberData, 'id'>) => Promise<void>;
  member?: TeamMemberData | null;
}

export function TeamMemberDialog({ open, onClose, onSave, member }: TeamMemberDialogProps) {
  const [name, setName] = useState(member?.name || '');
  const [roleTitle, setRoleTitle] = useState(member?.roleTitle || '');
  const [avatarInitials, setAvatarInitials] = useState(member?.avatarInitials || '');
  const [saving, setSaving] = useState(false);

  const isEditMode = !!member;

  // Generate initials from name
  const generateInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset to member values or empty
      setName(member?.name || '');
      setRoleTitle(member?.roleTitle || '');
      setAvatarInitials(member?.avatarInitials || '');
    }
    if (!isOpen) {
      onClose();
    }
  };

  // Handle name change and auto-generate initials for new members
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!isEditMode && newName.length >= 2) {
      setAvatarInitials(generateInitials(newName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roleTitle.trim()) return;

    setSaving(true);
    await onSave({
      name: name.trim(),
      roleTitle: roleTitle.trim(),
      avatarInitials: avatarInitials.trim() || generateInitials(name),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update the team member details below.'
                : 'Enter the details for the new team member.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., John Smith"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roleTitle">Role / Title *</Label>
              <Input
                id="roleTitle"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g., AI Solutions Lead"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatarInitials">Avatar Initials</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="avatarInitials"
                  value={avatarInitials}
                  onChange={(e) => setAvatarInitials(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="JS"
                  maxLength={2}
                  className="w-20"
                />
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#123A43' }}
                >
                  {avatarInitials || '??'}
                </div>
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !roleTitle.trim() || saving}
              style={{ backgroundColor: '#B06C50' }}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
