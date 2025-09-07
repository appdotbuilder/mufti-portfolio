import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Github, 
  ExternalLink, 
  Plus,
  Edit,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { ProjectImage } from '@/components/ImagePlaceholder';
import { ImageInstructions } from '@/components/ImageInstructions';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../../../server/src/schema';

export function PortfolioManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state for creating projects
  const [createFormData, setCreateFormData] = useState<CreateProjectInput>({
    title: '',
    description: '',
    image_url: null,
    github_url: null,
    demo_url: null,
    technologies: []
  });

  // Form state for editing projects
  const [editFormData, setEditFormData] = useState<Omit<UpdateProjectInput, 'id'>>({
    title: '',
    description: '',
    image_url: null,
    github_url: null,
    demo_url: null,
    technologies: []
  });

  const [techInput, setTechInput] = useState('');

  const loadProjects = useCallback(async () => {
    try {
      const result = await trpc.getProjects.query();
      setProjects(result);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createProject.mutate(createFormData);
      setProjects((prev: Project[]) => [...prev, response]);
      setCreateFormData({
        title: '',
        description: '',
        image_url: null,
        github_url: null,
        demo_url: null,
        technologies: []
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateProjectInput = {
        id: editingProject.id,
        ...editFormData
      };
      const response = await trpc.updateProject.mutate(updateData);
      setProjects((prev: Project[]) => 
        prev.map(p => p.id === editingProject.id ? response : p)
      );
      setEditingProject(null);
      setEditFormData({
        title: '',
        description: '',
        image_url: null,
        github_url: null,
        demo_url: null,
        technologies: []
      });
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await trpc.deleteProject.mutate({ id });
      setProjects((prev: Project[]) => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const addTechnology = (formType: 'create' | 'edit') => {
    if (!techInput.trim()) return;
    
    if (formType === 'create') {
      setCreateFormData((prev: CreateProjectInput) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
    }
    setTechInput('');
  };

  const removeTechnology = (index: number, formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateFormData((prev: CreateProjectInput) => ({
        ...prev,
        technologies: prev.technologies.filter((_, i) => i !== index)
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        technologies: (prev.technologies || []).filter((_, i) => i !== index)
      }));
    }
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setEditFormData({
      title: project.title,
      description: project.description,
      image_url: project.image_url,
      github_url: project.github_url,
      demo_url: project.demo_url,
      technologies: project.technologies
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          My Portfolio
        </h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Here are some of the projects I've worked on. Each project represents a step in my journey as a developer.
        </p>
        
        {/* Add Project Button */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={createFormData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateProjectInput) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCreateFormData((prev: CreateProjectInput) => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  value={createFormData.image_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateProjectInput) => ({ 
                      ...prev, 
                      image_url: e.target.value || null 
                    }))
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="github_url">GitHub URL (optional)</Label>
                <Input
                  id="github_url"
                  value={createFormData.github_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateProjectInput) => ({ 
                      ...prev, 
                      github_url: e.target.value || null 
                    }))
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="demo_url">Demo URL (optional)</Label>
                <Input
                  id="demo_url"
                  value={createFormData.demo_url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateProjectInput) => ({ 
                      ...prev, 
                      demo_url: e.target.value || null 
                    }))
                  }
                />
              </div>
              
              <div>
                <Label>Technologies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={techInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechInput(e.target.value)}
                    placeholder="Add technology"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addTechnology('create'))}
                  />
                  <Button type="button" onClick={() => addTechnology('create')} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {createFormData.technologies.map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeTechnology(index, 'create')}
                    >
                      {tech} ×
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project: Project) => (
          <Card key={project.id} className="group hover:shadow-xl transition-all duration-300">
            <div className="aspect-video rounded-t-lg overflow-hidden">
              <ProjectImage 
                src={project.image_url || undefined}
                alt={project.title}
                title={project.title}
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {project.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Github size={16} />
                        Code
                      </Button>
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <ExternalLink size={16} />
                        Demo
                      </Button>
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => startEditProject(project)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty state when no projects */}
        {projects.length === 0 && (
          <Card className="col-span-full border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <FolderOpen size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your portfolio by adding your first project!
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Instructions */}
      <div className="mt-12">
        <ImageInstructions />
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Project Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-image_url">Image URL (optional)</Label>
              <Input
                id="edit-image_url"
                value={editFormData.image_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ 
                    ...prev, 
                    image_url: e.target.value || null 
                  }))
                }
              />
            </div>
            
            <div>
              <Label htmlFor="edit-github_url">GitHub URL (optional)</Label>
              <Input
                id="edit-github_url"
                value={editFormData.github_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ 
                    ...prev, 
                    github_url: e.target.value || null 
                  }))
                }
              />
            </div>
            
            <div>
              <Label htmlFor="edit-demo_url">Demo URL (optional)</Label>
              <Input
                id="edit-demo_url"
                value={editFormData.demo_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev) => ({ 
                    ...prev, 
                    demo_url: e.target.value || null 
                  }))
                }
              />
            </div>
            
            <div>
              <Label>Technologies</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechInput(e.target.value)}
                  placeholder="Add technology"
                  onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addTechnology('edit'))}
                />
                <Button type="button" onClick={() => addTechnology('edit')} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(editFormData.technologies || []).map((tech, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeTechnology(index, 'edit')}
                  >
                    {tech} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Updating...' : 'Update Project'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}