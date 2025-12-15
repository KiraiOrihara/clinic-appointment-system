import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, CheckCircle } from "lucide-react";

const DesignTest = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      {/* CSS Test - This should show a red background if CSS is loading */}
      <div className="mb-8 force-red-bg p-4 rounded-lg text-white">
        <h2 className="text-2xl font-bold">CSS Loading Test</h2>
        <p>If this has a red background, CSS is working!</p>
      </div>

      {/* Design System Test */}
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section Test */}
        <div className="bg-gradient-hero p-8 rounded-2xl text-white">
          <div className="bg-grid-white/[0.05] absolute inset-0 rounded-2xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Design System Test</h1>
            <p className="text-lg opacity-90">Testing all design components</p>
          </div>
        </div>

        {/* Button Variants Test */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badge Test */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge className="bg-success text-white">Success</Badge>
              <Badge className="bg-warning text-white">Warning</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Healthcare Cards Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="healthcare-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Clinic Card</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span>4.8 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Verified Clinic</span>
                </div>
                <p className="text-muted-foreground">
                  Professional healthcare services with modern facilities and experienced staff.
                </p>
                <Button className="w-full">Book Appointment</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="healthcare-feature-card">
            <CardHeader>
              <CardTitle>Feature Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Advanced Features</h3>
                <p className="text-muted-foreground">
                  State-of-the-art medical equipment and cutting-edge treatment options.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>24/7 Emergency Care</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Specialist Consultations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Digital Health Records</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Scheme Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color Scheme Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-full h-16 bg-primary rounded-lg mb-2"></div>
                <p className="text-sm">Primary</p>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-secondary rounded-lg mb-2"></div>
                <p className="text-sm">Secondary</p>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-success rounded-lg mb-2"></div>
                <p className="text-sm">Success</p>
              </div>
              <div className="text-center">
                <div className="w-full h-16 bg-destructive rounded-lg mb-2"></div>
                <p className="text-sm">Destructive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignTest;
