'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type TeamMember } from '@/types';
import { 
  fetchPortfolioCategoriesWithRatings, 
  upsertPortfolioRating, 
  type PortfolioCategory 
} from '@/lib/data';
import { toast } from 'sonner';

interface PortfolioTabProps {
  member: TeamMember;
  editMode: boolean;
  orgId: string;
}

interface CategoryWithRating {
  category: PortfolioCategory;
  rating: number;
}

export function PortfolioTab({ member, editMode, orgId }: PortfolioTabProps) {
  const [items, setItems] = useState<CategoryWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      const data = await fetchPortfolioCategoriesWithRatings(orgId, member.id);
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [member.id, orgId]);

  const handleRatingClick = async (categoryId: string, categoryName: string, newRating: number) => {
    if (!editMode) return;
    
    setSaving(categoryId);
    const success = await upsertPortfolioRating(orgId, member.id, categoryId, newRating);
    setSaving(null);
    
    if (success) {
      setItems(prev => 
        prev.map(item => 
          item.category.id === categoryId 
            ? { ...item, rating: newRating } 
            : item
        )
      );
      toast.success(`Updated ${categoryName} rating to ${newRating}/5`);
    } else {
      toast.error('Failed to update rating');
    }
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading portfolio...</div>
        </CardContent>
      </Card>
    );
  }

  // In view mode, only show items with rating > 0
  const displayItems = editMode ? items : items.filter(item => item.rating > 0);

  return (
    <div className="space-y-6">
      {editMode && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(176, 108, 80, 0.1)' }}>
          <p className="text-sm" style={{ color: '#B06C50' }}>
            ✏️ Click on the rating dots to update your portfolio ratings. Items with rating 0 are hidden in view mode.
          </p>
          <p className="text-xs mt-1" style={{ color: '#8795B0' }}>
            💡 To add new categories, go to <strong>Portfolio Catalog</strong> in the Team section.
          </p>
        </div>
      )}

      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#123A43' }}>AI Solution Portfolio</CardTitle>
          <p className="text-sm" style={{ color: '#5D7D87' }}>
            Rate your experience with different AI solution categories
          </p>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8795B0' }}>
              No portfolio categories available. Ask a supervisor to add categories in the Portfolio Catalog.
            </p>
          ) : displayItems.length === 0 && !editMode ? (
            <p className="text-center py-8" style={{ color: '#8795B0' }}>
              No rated categories yet. Enable edit mode to rate your skills.
            </p>
          ) : (
            <div className="space-y-4">
              {(editMode ? items : displayItems).map(({ category, rating }) => (
                <div
                  key={category.id}
                  className="flex items-start justify-between p-4 rounded-lg"
                  style={{ 
                    backgroundColor: rating === 0 ? 'rgba(176, 108, 80, 0.05)' : '#f8fafb',
                    border: rating === 0 ? '1px dashed #CEDADD' : '1px solid #CEDADD',
                  }}
                >
                  <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                        style={{ backgroundColor: '#123A43', color: '#fff' }}
                      >
                        {category.key}
                      </span>
                      <span 
                        className="font-medium"
                        style={{ color: rating === 0 ? '#8795B0' : '#123A43' }}
                      >
                        {category.name}
                        {rating === 0 && <span className="text-xs ml-1">(unrated)</span>}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm mt-1" style={{ color: '#5D7D87' }}>
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`${category.id}-star-${star}`}
                        type="button"
                        disabled={!editMode || saving === category.id}
                        onClick={() => handleRatingClick(category.id, category.name, star)}
                        className={`w-6 h-6 rounded-full transition-all ${
                          editMode 
                            ? 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-[#B06C50]' 
                            : 'cursor-default'
                        } ${saving === category.id ? 'opacity-50' : ''}`}
                        style={{
                          backgroundColor: star <= rating ? '#B06C50' : '#CEDADD',
                        }}
                        title={editMode ? `Rate ${star}/5` : undefined}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
