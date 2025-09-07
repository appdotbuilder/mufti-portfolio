import { Image as ImageIcon } from 'lucide-react';

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
  text?: string;
  showIcon?: boolean;
}

export function ImagePlaceholder({ 
  width = 400, 
  height = 300, 
  className = "", 
  text = "Project Image",
  showIcon = true 
}: ImagePlaceholderProps) {
  return (
    <div 
      className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-gray-500 text-center">
        {showIcon && (
          <ImageIcon size={48} className="mx-auto mb-2" />
        )}
        <p className="text-sm">{text}</p>
        <p className="text-xs text-gray-400 mt-1">
          Place images in: /public/images/
        </p>
      </div>
    </div>
  );
}

// Component for project images specifically
interface ProjectImageProps {
  src?: string;
  alt?: string;
  title: string;
  className?: string;
}

export function ProjectImage({ src, alt, title, className = "" }: ProjectImageProps) {
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt || title} 
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <ImagePlaceholder 
      className={`w-full h-full ${className}`}
      text={`${title} Image`}
      showIcon={true}
    />
  );
}