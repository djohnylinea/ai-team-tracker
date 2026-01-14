'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { OverviewTab } from '@/components/TabContent/OverviewTab';
import { ProjectsTab } from '@/components/TabContent/ProjectsTab';
import { PortfolioTab } from '@/components/TabContent/PortfolioTab';
import { PortfolioCatalogTab } from '@/components/TabContent/PortfolioCatalogTab';
import { SkillsTab } from '@/components/TabContent/SkillsTab';
import { AwarenessTab } from '@/components/TabContent/AwarenessTab';
import { EngagementsTab } from '@/components/TabContent/EngagementsTab';
import { EventsTab } from '@/components/TabContent/EventsTab';
import { TimeOffTab } from '@/components/TabContent/TimeOffTab';
import { TeamDashboardTab } from '@/components/TabContent/TeamDashboardTab';
import { CalendarTab } from '@/components/TabContent/CalendarTab';
import { type TeamMember, type TabKey } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit2, Save } from 'lucide-react';

// Tab labels for title
const TAB_LABELS: Record<TabKey, string> = {
  overview: 'Overview',
  projects: 'Projects',
  portfolio: 'Portfolio',
  skills: 'Skills & Tools',
  awareness: 'Awareness',
  engagements: 'Engagements',
  events: 'Events',
  'time-off': 'Time Off',
  'team-dashboard': 'Team Dashboard',
  'calendar': 'Calendar',
  'portfolio-catalog': 'Portfolio Catalog',
};

// Tabs that support edit mode
const EDITABLE_TABS: TabKey[] = ['projects', 'portfolio', 'skills', 'awareness', 'engagements', 'events', 'time-off'];

interface DashboardClientProps {
  userEmail: string;
  members: TeamMember[];
  orgId: string;
}

export function DashboardClient({ userEmail, members, orgId }: DashboardClientProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(members[0] || null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [editMode, setEditMode] = useState(false);

  // Handle empty members case
  if (!members.length || !selectedMember) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">No team members found</h2>
          <p className="mt-2 text-gray-500">Your organization has no team members yet, or you may not have access.</p>
          <p className="mt-1 text-sm text-gray-400">Logged in as: {userEmail}</p>
        </div>
      </div>
    );
  }

  const showEditButton = EDITABLE_TABS.includes(activeTab);
  const pageTitle =
    activeTab === 'team-dashboard'
      ? 'Team Dashboard'
      : activeTab === 'calendar'
      ? 'Team Calendar'
      : activeTab === 'portfolio-catalog'
      ? 'Portfolio Catalog'
      : `${selectedMember.name} - ${TAB_LABELS[activeTab]}`;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab member={selectedMember} />;
      case 'projects':
        return <ProjectsTab member={selectedMember} editMode={editMode} orgId={orgId} />;
      case 'portfolio':
        return <PortfolioTab member={selectedMember} editMode={editMode} orgId={orgId} />;
      case 'portfolio-catalog':
        return <PortfolioCatalogTab orgId={orgId} />;
      case 'skills':
        return <SkillsTab member={selectedMember} editMode={editMode} orgId={orgId} />;
      case 'awareness':
        return <AwarenessTab member={selectedMember} editMode={editMode} orgId={orgId} />;
      case 'engagements':
        return <EngagementsTab member={selectedMember} editMode={editMode} orgId={orgId} />;
      case 'events':
        return <EventsTab member={selectedMember} editMode={editMode} orgId={orgId} />;
      case 'time-off':
        return <TimeOffTab member={selectedMember} editMode={editMode} orgId={orgId} />;
      case 'team-dashboard':
        return <TeamDashboardTab orgId={orgId} />;
      case 'calendar':
        return <CalendarTab orgId={orgId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafb' }}>
      <Header
        selectedMember={selectedMember}
        members={members}
        onMemberSelect={setSelectedMember}
        userEmail={userEmail}
      />

      <div className="flex flex-1">
        <Sidebar
          selectedMember={selectedMember}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setEditMode(false); // Reset edit mode when switching tabs
          }}
        />

        <main className="flex-1 p-6 overflow-auto">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold" style={{ color: '#123A43' }}>
              {pageTitle}
            </h2>

            {showEditButton && (
              <Button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: editMode ? '#B06C50' : '#5D7D87',
                }}
              >
                {editMode ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit Mode
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Tab content */}
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
