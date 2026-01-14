'use client';

import { Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type TabKey, type TeamMember, TABS } from '@/types';
import { OverviewTab } from './TabContent/OverviewTab';
import { ProjectsTab } from './TabContent/ProjectsTab';
import { SkillsTab } from './TabContent/SkillsTab';
import { AwarenessTab } from './TabContent/AwarenessTab';
import { EngagementsTab } from './TabContent/EngagementsTab';
import { EventsTab } from './TabContent/EventsTab';
import { TeamDashboardTab } from './TabContent/TeamDashboardTab';

interface MainContentProps {
  selectedMember: TeamMember;
  activeTab: TabKey;
  editMode: boolean;
  onToggleEditMode: () => void;
}

export function MainContent({
  selectedMember,
  activeTab,
  editMode,
  onToggleEditMode,
}: MainContentProps) {
  const tabDefinition = TABS.find((t) => t.key === activeTab);
  const showEditButton =
    activeTab !== 'overview' && activeTab !== 'team-dashboard';

  const getPageTitle = () => {
    if (activeTab === 'team-dashboard') {
      return 'Team Dashboard';
    }
    const tabLabel = tabDefinition?.label || activeTab;
    return `${selectedMember.name} - ${tabLabel}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab member={selectedMember} />;
      case 'projects':
        return <ProjectsTab member={selectedMember} editMode={editMode} />;
      case 'skills':
        return <SkillsTab member={selectedMember} editMode={editMode} />;
      case 'awareness':
        return <AwarenessTab member={selectedMember} editMode={editMode} />;
      case 'engagements':
        return <EngagementsTab member={selectedMember} editMode={editMode} />;
      case 'events':
        return <EventsTab member={selectedMember} editMode={editMode} />;
      case 'team-dashboard':
        return <TeamDashboardTab />;
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Page header */}
      <div
        className="h-14 px-6 flex items-center justify-between border-b no-print"
        style={{ borderColor: '#CEDADD' }}
      >
        <h2 className="text-xl font-semibold" style={{ color: '#123A43' }}>
          {getPageTitle()}
        </h2>

        {showEditButton && (
          <Button
            onClick={onToggleEditMode}
            className="flex items-center gap-2"
            style={{
              backgroundColor: editMode ? '#B06C50' : '#5D7D87',
            }}
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span>Edit Mode</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#f8fafb' }}>
        {renderTabContent()}
      </div>
    </main>
  );
}
