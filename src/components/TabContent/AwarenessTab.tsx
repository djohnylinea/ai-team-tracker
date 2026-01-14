'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type TeamMember, AWARENESS_AREAS } from '@/types';
import { 
  fetchAllAwarenessRatings, 
  updateAwarenessRating, 
  createAwarenessArea,
  deleteAwarenessArea,
  type AwarenessRatingFull 
} from '@/lib/data';
import { AddAwarenessAreaDialog } from '@/components/dialogs/AddAwarenessAreaDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface AwarenessTabProps {
  member: TeamMember;
  editMode: boolean;
  orgId: string;
}

export function AwarenessTab({ member, editMode, orgId }: AwarenessTabProps) {
  const [ratings, setRatings] = useState<AwarenessRatingFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingArea, setDeletingArea] = useState<AwarenessRatingFull | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      const data = await fetchAllAwarenessRatings(member.id, orgId);
      if (!cancelled) {
        setRatings(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [member.id, orgId]);

  const handleRatingClick = async (areaKey: string, areaLabel: string, newRating: number) => {
    if (!editMode) return;
    
    setSaving(areaKey);
    const success = await updateAwarenessRating(member.id, orgId, areaKey, newRating);
    setSaving(null);
    
    if (success) {
      setRatings(prev => 
        prev.map(r => r.areaKey === areaKey ? { ...r, rating: newRating } : r)
      );
      toast.success(`Updated ${areaLabel} to ${newRating}/5`);
    } else {
      toast.error('Failed to update rating');
    }
  };

  const handleAddArea = async (areaKey: string, label: string, description: string) => {
    const newArea = await createAwarenessArea(orgId, areaKey, label, description);
    if (newArea) {
      // Add to local state with rating=0
      setRatings(prev => [...prev, {
        id: `new-${newArea.key}`,
        areaId: newArea.key,
        areaKey: newArea.key,
        areaLabel: newArea.label,
        areaDescription: newArea.description || '',
        rating: 0,
      }]);
      toast.success(`Added "${label}" to the catalog`);
    } else {
      toast.error('Failed to add awareness area');
    }
  };

  const handleDeleteClick = (area: AwarenessRatingFull) => {
    setDeletingArea(area);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingArea) return;
    
    const success = await deleteAwarenessArea(deletingArea.areaId, deletingArea.areaKey);
    if (success) {
      setRatings(prev => prev.filter(r => r.areaKey !== deletingArea.areaKey));
      toast.success(`Removed "${deletingArea.areaLabel}" from catalog`);
    } else {
      toast.error('Failed to delete awareness area');
    }
    setDeleteDialogOpen(false);
    setDeletingArea(null);
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading awareness ratings...</div>
        </CardContent>
      </Card>
    );
  }

  const getRingColorClass = (rating: number) => {
    if (rating >= 4) return 'hover:ring-green-500';
    if (rating >= 2) return 'hover:ring-[#B06C50]';
    return 'hover:ring-red-500';
  };

  // In view mode: filter out rating=0; in edit mode: show all
  const displayRatings = editMode 
    ? ratings 
    : ratings.filter(r => r.rating > 0);

  return (
    <Card className="border" style={{ borderColor: '#CEDADD' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle style={{ color: '#123A43' }}>AI Awareness & Skills</CardTitle>
            <p className="text-sm" style={{ color: '#5D7D87' }}>
              Self-assessment ratings for various AI-related competencies
            </p>
          </div>
          {editMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddDialogOpen(true)}
              className="flex items-center gap-1"
              style={{ borderColor: '#B06C50', color: '#B06C50' }}
            >
              <Plus className="w-4 h-4" />
              Add Area
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editMode && (
          <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'rgba(176, 108, 80, 0.1)' }}>
            <p className="text-sm" style={{ color: '#B06C50' }}>
              ✏️ Click on the rating buttons to update awareness levels. Items with rating 0 are hidden in view mode.
            </p>
          </div>
        )}
        
        {displayRatings.length === 0 ? (
          <p className="text-center py-4" style={{ color: '#8795B0' }}>
            {editMode 
              ? 'No awareness areas yet. Click "Add Area" to add one.'
              : ratings.length > 0 
                ? 'All awareness areas are unrated. Enable edit mode to rate them.'
                : 'No awareness areas configured yet.'}
          </p>
        ) : (
          displayRatings.map((area) => {
            const isSaving = saving === area.areaKey;
            
            return (
              <div 
                key={area.areaKey} 
                className="space-y-2 p-3 rounded-lg"
                style={{ 
                  backgroundColor: area.rating === 0 ? 'rgba(176, 108, 80, 0.05)' : 'transparent',
                  border: area.rating === 0 ? '1px dashed #CEDADD' : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span 
                      className="font-medium" 
                      style={{ color: area.rating === 0 ? '#8795B0' : '#123A43' }}
                    >
                      {area.areaLabel}
                      {area.rating === 0 && <span className="text-xs ml-1">(unrated)</span>}
                    </span>
                    <p className="text-xs" style={{ color: '#8795B0' }}>
                      {area.areaDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleRatingClick(area.areaKey, area.areaLabel, level)}
                              className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                                isSaving ? 'opacity-50' : `hover:scale-110 hover:ring-2 hover:ring-offset-1 ${getRingColorClass(area.rating)}`
                              }`}
                              style={{
                                backgroundColor: level <= area.rating 
                                  ? (area.rating >= 4 ? '#22c55e' : area.rating >= 2 ? '#B06C50' : '#dc2626')
                                  : '#CEDADD',
                                color: level <= area.rating ? 'white' : '#5D7D87',
                              }}
                              title={`Rate ${level}/5`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(area)}
                          className="ml-2 p-1 rounded hover:bg-red-50"
                          title="Remove from catalog"
                        >
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                        </button>
                      </>
                    ) : (
                      <span
                        className="text-lg font-bold"
                        style={{ color: area.rating >= 4 ? '#22c55e' : area.rating >= 2 ? '#B06C50' : '#dc2626' }}
                      >
                        {area.rating}/5
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: '#CEDADD' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: area.rating >= 4 ? '#22c55e' : area.rating >= 2 ? '#B06C50' : '#dc2626',
                      width: `${area.rating * 20}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Add Area Dialog */}
      <AddAwarenessAreaDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddArea}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
        onConfirm={handleConfirmDelete}
        title="Remove Awareness Area from Catalog"
        description={`Are you sure you want to remove "${deletingArea?.areaLabel}" from the catalog? This will remove it for all team members.`}
      />
    </Card>
  );
}
