# Image Management for Portfolio

This portfolio application is designed to work with images stored in the `public/images/` directory.

## Folder Structure

Create the following folder structure in your project root:

```
public/
├── images/
    ├── projects/          # Project screenshots and demos
    ├── profile/           # Profile photos
    └── icons/             # Custom icons and logos
```

## How to Add Images

### For Project Images:
1. Place your project images in `public/images/projects/`
2. When adding a project through the portfolio manager, use the path: `/images/projects/your-image.jpg`
3. Supported formats: JPG, PNG, GIF, WebP

### Example Project Image URLs:
- `/images/projects/ecommerce-app.png`
- `/images/projects/weather-dashboard.jpg`
- `/images/projects/todo-app-screenshot.png`

### For Profile Images:
- Place in `public/images/profile/`
- Use path: `/images/profile/your-photo.jpg`

## Features Without Images

The application works perfectly without images:
- Placeholder images are automatically shown
- All functionality remains intact
- Professional-looking placeholders maintain the design

## Image Optimization Tips

1. **Size**: Optimize images to be under 1MB for web performance
2. **Dimensions**: Project images work best at 1200x800px or 16:9 aspect ratio
3. **Format**: Use WebP when possible for better compression
4. **Naming**: Use descriptive names like `project-name-screenshot.jpg`

## Integration with Backend

The portfolio uses a full backend system to manage:
- Profile information (name, email, bio, etc.)
- Skills and technologies
- Project details and metadata
- All project CRUD operations

Images are referenced by URL, making it easy to:
- Use local images from the public folder
- Link to external hosting services
- Update images without touching the database

## Next Steps

1. Create the `public/images/` folder structure
2. Add your project images
3. Use the portfolio manager to create projects with image URLs
4. The application will handle the rest automatically!