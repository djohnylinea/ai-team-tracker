'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type TeamMember, TOOL_CATEGORIES } from '@/types';
import { 
  fetchAllToolRatings, 
  updateToolRating, 
  createTool, 
  deleteTool,
  type ToolRating 
} from '@/lib/data';
import { AddToolDialog } from '@/components/dialogs/AddToolDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface SkillsTabProps {
  member: TeamMember;
  editMode: boolean;
  orgId: string;
}

export function SkillsTab({ member, editMode, orgId }: SkillsTabProps) {
  const [ratings, setRatings] = useState<ToolRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogCategory, setAddDialogCategory] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTool, setDeletingTool] = useState<ToolRating | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      // In edit mode, fetch ALL tools including rating=0
      const data = await fetchAllToolRatings(member.id, orgId);
      if (!cancelled) {
        setRatings(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [member.id, orgId]);

  const handleRatingClick = async (toolId: string, toolName: string, newRating: number) => {
    if (!editMode) return;
    
    setSaving(toolId);
    const success = await updateToolRating(member.id, orgId, toolId, newRating);
    setSaving(null);
    
    if (success) {
      setRatings(prev => 
        prev.map(r => r.toolId === toolId ? { ...r, rating: newRating } : r)
      );
      toast.success(`Updated ${toolName} rating to ${newRating}/5`);
    } else {
      toast.error('Failed to update rating');
    }
  };

  const handleSaveTool = async (toolName: string, categoryKey: string) => {
    const newTool = await createTool(orgId, toolName, categoryKey);
    if (newTool) {
      // Add to local state with rating=0
      setRatings(prev => [...prev, {
        id: `new-${newTool.id}`,
        toolId: newTool.id,
        toolName: newTool.toolName,
        categoryKey: newTool.categoryKey,
        rating: 0,
      }]);
      toast.success(`Added "${toolName}" to the catalog`);
    } else {
      toast.error('Failed to add tool');
    }
  };

  const handleDeleteClick = (tool: ToolRating) => {
    setDeletingTool(tool);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTool) return;
    
    const success = await deleteTool(deletingTool.toolId);
    if (success) {
      setRatings(prev => prev.filter(r => r.toolId !== deletingTool.toolId));
      toast.success(`Removed "${deletingTool.toolName}" from catalog`);
    } else {
      toast.error('Failed to delete tool');
    }
    setDeleteDialogOpen(false);
    setDeletingTool(null);
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading skills...</div>
        </CardContent>
      </Card>
    );
  }

  // Group ratings by category
  // In view mode: filter out rating=0; in edit mode: show all
  const ratingsByCategory = TOOL_CATEGORIES.reduce((acc, cat) => {
    const categoryRatings = ratings.filter(r => r.categoryKey === cat.key);
    acc[cat.key] = editMode 
      ? categoryRatings 
      : categoryRatings.filter(r => r.rating > 0);
    return acc;
  }, {} as Record<string, ToolRating[]>);

  return (
    <div className="space-y-6">
      {editMode && (
        <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(176, 108, 80, 0.1)' }}>
          <p className="text-sm" style={{ color: '#B06C50' }}>
            ✏️ Click on the rating dots to update skill ratings. Items with rating 0 are hidden in view mode.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAddDialogCategory('');
              setAddDialogOpen(true);
            }}
            className="flex items-center gap-1 ml-4"
            style={{ borderColor: '#B06C50', color: '#B06C50' }}
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </Button>
        </div>
      )}
      
      {TOOL_CATEGORIES.map((category) => {
        const categoryRatings = ratingsByCategory[category.key] || [];
        const allCategoryRatings = ratings.filter(r => r.categoryKey === category.key);
        
        return (
          <Card key={category.key} className="border" style={{ borderColor: '#CEDADD' }}>
            <CardHeader>
              <div>
                <CardTitle style={{ color: '#123A43' }}>{category.title}</CardTitle>
                <p className="text-sm" style={{ color: '#5D7D87' }}>
                  {category.description}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {categoryRatings.length === 0 ? (
                <p className="text-center py-4" style={{ color: '#8795B0' }}>
                  {editMode 
                    ? 'No tools in this category yet. Click "Add Tool" to add one.'
                    : allCategoryRatings.length > 0 
                      ? 'All tools in this category are unrated. Enable edit mode to rate them.'
                      : 'No tools in this category yet.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryRatings.map((rating) => (
                    <div
                      key={rating.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ 
                        backgroundColor: rating.rating === 0 ? 'rgba(176, 108, 80, 0.05)' : '#f8fafb',
                        border: rating.rating === 0 ? '1px dashed #CEDADD' : 'none',
                      }}
                    >
                      <span style={{ color: rating.rating === 0 ? '#8795B0' : '#123A43' }}>
                        {rating.toolName}
                        {rating.rating === 0 && <span className="text-xs ml-1">(unrated)</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              disabled={!editMode || saving === rating.toolId}
                              onClick={() => handleRatingClick(rating.toolId, rating.toolName, star)}
                              className={`w-5 h-5 rounded-full transition-all ${
                                editMode 
                                  ? 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-[#B06C50]' 
                                  : 'cursor-default'
                              } ${saving === rating.toolId ? 'opacity-50' : ''}`}
                              style={{
                                backgroundColor:
                                  star <= rating.rating ? '#B06C50' : '#CEDADD',
                              }}
                              title={editMode ? `Rate ${star}/5` : undefined}
                            />
                          ))}
                        </div>
                        {editMode && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(rating)}
                            className="ml-2 p-1 rounded hover:bg-red-50"
                            title="Remove from catalog"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add Tool Dialog */}
      <AddToolDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveTool}
        defaultCategory={addDialogCategory}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
        onConfirm={handleConfirmDelete}
        title="Remove Tool from Catalog"
        description={`Are you sure you want to remove "${deletingTool?.toolName}" from the catalog? This will remove it for all team members.`}
      />
    </div>
  );
}
