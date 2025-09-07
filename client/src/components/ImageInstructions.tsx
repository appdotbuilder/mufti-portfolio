import { Info, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ImageInstructions() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Info size={20} />
          Image Storage Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <FolderOpen size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Folder Structure</h4>
            <p className="text-blue-700 text-sm">
              Create these folders in your project's <code className="bg-blue-200 px-1 rounded">public/</code> directory:
            </p>
            <ul className="text-blue-700 text-sm mt-2 ml-4 space-y-1">
              <li>• <code className="bg-blue-200 px-1 rounded">public/images/projects/</code> - For project screenshots</li>
              <li>• <code className="bg-blue-200 px-1 rounded">public/images/profile/</code> - For profile photos</li>
              <li>• <code className="bg-blue-200 px-1 rounded">public/images/icons/</code> - For custom icons</li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <ImageIcon size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Usage in Projects</h4>
            <p className="text-blue-700 text-sm">
              When adding projects, use paths like:
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300">
                /images/projects/my-project.jpg
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-blue-100 p-3 rounded-md">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> The portfolio is fully functional with or without images. 
            Placeholder images will be shown when no image URL is provided.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}