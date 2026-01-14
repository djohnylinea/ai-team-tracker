'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type TeamMember } from '@/types';
import { fetchMemberOverview, type MemberOverview } from '@/lib/data';

interface OverviewTabProps {
  member: TeamMember;
}

export function OverviewTab({ member }: OverviewTabProps) {
  const [data, setData] = useState<MemberOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const overview = await fetchMemberOverview(member.id);
      setData(overview);
      setLoading(false);
    }
    loadData();
  }, [member.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const { 
    activeProjects, 
    totalProjects, 
    allocation, 
    engagementCount, 
    portfolioAvg,
    portfolioRatings 
  } = data || {
    activeProjects: 0,
    totalProjects: 0,
    allocation: 0,
    engagementCount: 0,
    portfolioAvg: 0,
    portfolioRatings: [],
  };

  // Only show rated portfolio items (rating > 0)
  const ratedPortfolio = portfolioRatings.filter(r => r.rating > 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Projects */}
        <Card className="border" style={{ borderColor: '#8795B0' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: '#123A43' }}>
                {activeProjects}
              </p>
              <p className="text-sm mt-1" style={{ color: '#5D7D87' }}>
                {totalProjects} total projects
              </p>
            </div>
          </CardContent>
          <CardHeader className="pt-0 pb-4">
            <CardTitle
              className="text-sm text-center font-medium"
              style={{ color: '#5D7D87' }}
            >
              Active Projects
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Current Allocation */}
        <Card className="border" style={{ borderColor: '#8795B0' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: '#B06C50' }}>
                {allocation}%
              </p>
              <p className="text-sm mt-1" style={{ color: '#5D7D87' }}>
                {engagementCount} client engagements
              </p>
            </div>
          </CardContent>
          <CardHeader className="pt-0 pb-4">
            <CardTitle
              className="text-sm text-center font-medium"
              style={{ color: '#5D7D87' }}
            >
              Current Allocation
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Portfolio Avg */}
        <Card className="border" style={{ borderColor: '#8795B0' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{ color: '#8795B0' }}>
                {portfolioAvg.toFixed(1)}
              </p>
              <p className="text-sm mt-1" style={{ color: '#5D7D87' }}>
                {ratedPortfolio.length} rated categories
              </p>
            </div>
          </CardContent>
          <CardHeader className="pt-0 pb-4">
            <CardTitle
              className="text-sm text-center font-medium"
              style={{ color: '#5D7D87' }}
            >
              Portfolio Avg
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* AI Solution Portfolio */}
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader>
          <CardTitle style={{ color: '#123A43' }}>
            AI Solution Portfolio
          </CardTitle>
          <p className="text-sm" style={{ color: '#5D7D87' }}>
            Expertise areas with ratings (only showing rated categories)
          </p>
        </CardHeader>
        <CardContent>
          {ratedPortfolio.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#8795B0' }}>
              No portfolio ratings yet. Go to the Portfolio tab to add ratings.
            </p>
          ) : (
            <div className="space-y-4">
              {ratedPortfolio.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <span
                    className="px-2 py-1 rounded text-xs font-mono font-semibold text-white shrink-0"
                    style={{ backgroundColor: '#123A43' }}
                  >
                    {item.categoryKey}
                  </span>
                  <span className="font-medium shrink-0 w-48 truncate" style={{ color: '#123A43' }}>
                    {item.categoryName}
                  </span>
                  <div
                    className="flex-1 h-3 rounded-full"
                    style={{ backgroundColor: '#CEDADD' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: '#B06C50',
                        width: `${item.rating * 20}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={`${item.id}-star-${star}`}
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: star <= item.rating ? '#B06C50' : '#CEDADD',
                        }}
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
