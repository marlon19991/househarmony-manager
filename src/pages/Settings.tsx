import { Settings as SettingsIcon, Users } from "lucide-react";
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

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Perfiles
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Tema
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profiles">
          <ProfilesSection />
        </TabsContent>
        <TabsContent value="theme">
          <Card className="p-6">
            <ThemeSelector />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;