import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Linkedin, 
  MessageCircle,
  Home,
  User,
  FolderOpen
} from 'lucide-react';
import { PortfolioManager } from '@/components/PortfolioManager';
import type { Profile, Skill } from '../../server/src/schema';

type Page = 'home' | 'about' | 'portfolio';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);

  const loadProfile = useCallback(async () => {
    try {
      const profileData = await trpc.getProfile.query();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Use fallback data if profile doesn't exist
      setProfile({
        id: 1,
        name: 'Mufti Purwa',
        greeting: 'Hello! I\'m mufti.',
        email: 'muftipurwa4@gmail.com',
        linkedin_url: null,
        whatsapp_number: null,
        about_description: 'I have a background in fine arts, which I later applied in IT support. This experience sparked my passion for web development, where I now focus on blending creativity with technology.',
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }, []);

  const loadSkills = useCallback(async () => {
    try {
      const skillsData = await trpc.getSkills.query();
      if (skillsData.length === 0) {
        // Use fallback skills if none exist
        setSkills([
          'JavaScript', 'React', 'Git', 'GitHub', 'Bootstrap', 
          'HTML5', 'CSS3', 'Laravel', 'MySQL', 'Tailwind', 'Node.js'
        ].map((name, index) => ({
          id: index + 1,
          name,
          category: null,
          created_at: new Date()
        })));
      } else {
        setSkills(skillsData);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
      // Use fallback skills
      setSkills([
        'JavaScript', 'React', 'Git', 'GitHub', 'Bootstrap', 
        'HTML5', 'CSS3', 'Laravel', 'MySQL', 'Tailwind', 'Node.js'
      ].map((name, index) => ({
        id: index + 1,
        name,
        category: null,
        created_at: new Date()
      })));
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, [loadProfile, loadSkills]);

  // Navigation component
  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900">
            {profile?.name || 'Mufti Purwa'}
          </div>
          <div className="flex space-x-6">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2"
            >
              <Home size={16} />
              Home
            </Button>
            <Button
              variant={currentPage === 'about' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage('about')}
              className="flex items-center gap-2"
            >
              <User size={16} />
              About
            </Button>
            <Button
              variant={currentPage === 'portfolio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage('portfolio')}
              className="flex items-center gap-2"
            >
              <FolderOpen size={16} />
              Portfolio
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Home page component
  const HomePage = () => {
    if (!profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
      <div className="text-center max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
            MP
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {profile.greeting}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A passionate web developer blending creativity with technology to build amazing digital experiences.
          </p>
        </div>
        
        <div className="flex justify-center space-x-6">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 hover:text-blue-600"
          >
            <Mail size={20} />
            <span>Email</span>
          </a>
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 hover:text-blue-600"
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>
          )}
          {profile.whatsapp_number && (
            <a
              href={`https://wa.me/${profile.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 hover:text-green-600"
            >
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
    );
  };

  // About page component
  const AboutPage = () => {
    if (!profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
      <div className="min-h-screen bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Me
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 mb-4">My Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {profile.about_description}
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 mb-4">Get In Touch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={20} className="text-blue-600" />
                  <a 
                    href={`mailto:${profile.email}`} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    {profile.email}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 mb-6">Skills & Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill: Skill) => (
                  <Badge 
                    key={skill.id} 
                    variant="secondary" 
                    className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Portfolio page component
  const PortfolioPage = () => {
    return (
      <div className="min-h-screen bg-gray-50 py-20 px-6">
        <PortfolioManager />
      </div>
    );
  };

  // Main render function
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'portfolio':
        return <PortfolioPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;