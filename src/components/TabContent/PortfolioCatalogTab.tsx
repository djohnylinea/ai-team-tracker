'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  fetchPortfolioCategories, 
  createPortfolioCategory,
  deletePortfolioCategory,
  updatePortfolioCategory,
  type PortfolioCategory 
} from '@/lib/data';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PortfolioCatalogTabProps {
  orgId: string;
}

export function PortfolioCatalogTab({ orgId }: PortfolioCatalogTabProps) {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<PortfolioCategory | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Add form state
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      console.log('PortfolioCatalogTab: Loading categories for orgId:', orgId);
      setLoading(true);
      const data = await fetchPortfolioCategories(orgId);
      console.log('PortfolioCatalogTab: Fetched categories:', data);
      setCategories(data);
      setLoading(false);
    }
    loadData();
  }, [orgId]);

  const handleAddCategory = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    const key = newKey.trim() || newName.trim().toUpperCase().replace(/\s+/g, '_').substring(0, 10);
    
    setAddSaving(true);
    const newCategory = await createPortfolioCategory(orgId, key, newName.trim(), newDescription.trim() || undefined);
    setAddSaving(false);
    
    if (newCategory) {
      setCategories(prev => [...prev, newCategory]);
      toast.success(`Added "${newName}" category - now available for all team members`);
      setAddDialogOpen(false);
      setNewKey('');
      setNewName('');
      setNewDescription('');
    } else {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteClick = (category: PortfolioCategory) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    
    const success = await deletePortfolioCategory(deletingCategory.id);
    if (success) {
      setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
      toast.success(`Removed "${deletingCategory.name}" - removed from all team members`);
    } else {
      toast.error('Failed to delete category');
    }
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  const handleEditStart = (category: PortfolioCategory) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const handleEditSave = async (category: PortfolioCategory) => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    const success = await updatePortfolioCategory(category.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
    
    if (success) {
      setCategories(prev => prev.map(c => 
        c.id === category.id 
          ? { ...c, name: editName.trim(), description: editDescription.trim() || null }
          : c
      ));
      toast.success('Category updated');
      setEditingId(null);
    } else {
      toast.error('Failed to update category');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading portfolio catalog...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(18, 58, 67, 0.1)' }}>
        <p className="text-sm" style={{ color: '#123A43' }}>
          📂 Manage portfolio categories here. Categories added here will be available for all team members to rate.
        </p>
        <Button
          size="sm"
          onClick={() => setAddDialogOpen(true)}
          className="flex items-center gap-1 ml-4"
          style={{ backgroundColor: '#123A43' }}
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#123A43' }}>Portfolio Categories ({categories.length})</CardTitle>
          <p className="text-sm" style={{ color: '#5D7D87' }}>
            These categories are shared across all team members
          </p>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8795B0' }}>
              No portfolio categories yet. Click &quot;Add Category&quot; to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start justify-between p-4 rounded-lg border"
                  style={{ borderColor: '#CEDADD', backgroundColor: '#f8fafb' }}
                >
                  {editingId === category.id ? (
                    // Edit mode
                    <div className="flex-1 space-y-2 mr-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Category name"
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description (optional)"
                        rows={2}
                      />
                    </div>
                  ) : (
                    // View mode
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                          style={{ backgroundColor: '#123A43', color: '#fff' }}
                        >
                          {category.key}
                        </span>
                        <span className="font-medium" style={{ color: '#123A43' }}>
                          {category.name}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm mt-1" style={{ color: '#5D7D87' }}>
                          {category.description}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    {editingId === category.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditSave(category)}
                          className="p-1.5 rounded hover:bg-green-50"
                          title="Save"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          className="p-1.5 rounded hover:bg-gray-100"
                          title="Cancel"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditStart(category)}
                          className="p-1.5 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(category)}
                          className="p-1.5 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Portfolio Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryKey">Short Key (optional)</Label>
              <Input
                id="categoryKey"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                placeholder="e.g., NLP, CV, MLOps"
                maxLength={10}
              />
              <p className="text-xs text-gray-500">
                A short abbreviation (auto-generated from name if left empty)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Natural Language Processing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What does this category cover?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setNewKey('');
                setNewName('');
                setNewDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={addSaving || !newName.trim()}
              style={{ backgroundColor: '#123A43' }}
            >
              {addSaving ? 'Adding...' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
        onConfirm={handleConfirmDelete}
        title="Remove Portfolio Category"
        description={`Are you sure you want to remove "${deletingCategory?.name}"? This will remove it from all team members.`}
      />
    </div>
  );
}
