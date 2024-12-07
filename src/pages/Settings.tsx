import { Settings as SettingsIcon, Palette, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSelector } from "@/components/Settings/ThemeSelector";
import { ProfilesSection } from "@/components/Settings/ProfilesSection";

const Settings = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Ajustes</h1>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Perfiles
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme" className="mt-0">
            <ThemeSelector />
          </TabsContent>
          
          <TabsContent value="profiles" className="mt-0">
            <ProfilesSection />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;