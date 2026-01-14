'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type TeamMember } from '@/types';
import { 
  fetchProjects, 
  createProject, 
  updateProject, 
  deleteProject,
  type Project 
} from '@/lib/data';
import { arrayToCSV, downloadCSV, printElement } from '@/lib/export';
import { ProjectDialog } from '@/components/dialogs/ProjectDialog';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';
import { toast } from 'sonner';

interface ProjectsTabProps {
  member: TeamMember;
  editMode: boolean;
  orgId: string;
}

const getTypeBadgeStyle = (type: string) => {
  switch (type) {
    case 'AI Use Case':
      return { backgroundColor: 'rgba(18, 58, 67, 0.1)', color: '#123A43' };
    case 'AI Community Center':
      return { backgroundColor: 'rgba(135, 149, 176, 0.2)', color: '#8795B0' };
    case 'Other AI Initiative':
      return { backgroundColor: 'rgba(176, 108, 80, 0.15)', color: '#B06C50' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'Active':
      return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' };
    case 'Completed':
      return { backgroundColor: 'rgba(206, 218, 221, 0.5)', color: '#5D7D87' };
    default:
      return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

export function ProjectsTab({ member, editMode, orgId }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchProjects(member.id);
    setProjects(data);
    setLoading(false);
  }, [member.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddProject = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id'>) => {
    if (editingProject) {
      // Update existing project
      const success = await updateProject(editingProject.id, projectData);
      if (success) {
        toast.success('Project updated successfully');
        await loadData();
      } else {
        toast.error('Failed to update project');
        throw new Error('Failed to update project');
      }
    } else {
      // Create new project
      const newProject = await createProject(member.id, orgId, projectData);
      if (newProject) {
        toast.success('Project created successfully');
        await loadData();
      } else {
        toast.error('Failed to create project');
        throw new Error('Failed to create project');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    
    setDeleting(true);
    const success = await deleteProject(projectToDelete.id);
    setDeleting(false);
    
    if (success) {
      toast.success('Project deleted successfully');
      await loadData();
    } else {
      toast.error('Failed to delete project');
    }
  };

  const handleExportCSV = () => {
    const csvContent = arrayToCSV(projects, [
      { key: 'name', header: 'Project Name' },
      { key: 'type', header: 'Type' },
      { key: 'source', header: 'Source' },
      { key: 'reusable', header: 'Reusable' },
      { key: 'status', header: 'Status' },
    ]);
    downloadCSV(csvContent, `${member.name.replace(/\s+/g, '_')}_Projects`);
    toast.success('Projects exported to CSV');
  };

  const handlePrint = () => {
    printElement('projects-table', `${member.name} - Projects`);
  };

  if (loading) {
    return (
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Loading projects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border" style={{ borderColor: '#CEDADD' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle style={{ color: '#123A43' }}>Projects</CardTitle>
          <div className="flex items-center gap-2">
            {projects.length > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center gap-1"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </>
            )}
            {editMode && (
              <Button
                size="sm"
                className="flex items-center gap-2"
                style={{ backgroundColor: '#123A43' }}
                onClick={handleAddProject}
              >
                <Plus className="w-4 h-4" />
                Add Project
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: '#5D7D87' }}>No projects yet.</p>
              {editMode && (
                <p className="text-sm mt-1" style={{ color: '#8795B0' }}>
                  Click &apos;Add Project&apos; to create one.
                </p>
              )}
            </div>
          ) : (
            <div id="projects-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ color: '#5D7D87' }}>Project Name</TableHead>
                    <TableHead style={{ color: '#5D7D87' }}>Type</TableHead>
                    <TableHead style={{ color: '#5D7D87' }}>Source</TableHead>
                    <TableHead style={{ color: '#5D7D87' }}>Reusable</TableHead>
                    <TableHead style={{ color: '#5D7D87' }}>Status</TableHead>
                    {editMode && (
                      <TableHead style={{ color: '#5D7D87' }} className="print:hidden">Actions</TableHead>
                    )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell
                      className="font-medium"
                      style={{ color: '#123A43' }}
                    >
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        style={getTypeBadgeStyle(project.type)}
                      >
                        {project.type}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>
                      {project.source || '-'}
                    </TableCell>
                    <TableCell style={{ color: '#5D7D87' }}>
                      {project.reusable || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        style={getStatusBadgeStyle(project.status)}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    {editMode && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            style={{ color: '#5D7D87' }}
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleDeleteClick(project)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSave={handleSaveProject}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </>
  );
}
