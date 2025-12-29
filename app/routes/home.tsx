import type { Route } from "./+types/home";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { APP_CONFIG } from "~/config/app";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${APP_CONFIG.name} - Food Business Costing Assistant` },
    { name: "description", content: APP_CONFIG.description },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
            {APP_CONFIG.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {APP_CONFIG.description}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>📊 Cost Management</CardTitle>
              <CardDescription>
                Track ingredients, labor, and overhead expenses with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accurately compute COGS, operating expenses, and profit margins
                for your food products.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📁 Bulk Upload</CardTitle>
              <CardDescription>
                Import data from Excel or CSV files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Save time by uploading ingredients, expenses, and sales data in
                bulk.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📈 Financial Reports</CardTitle>
              <CardDescription>
                Generate comprehensive financial statements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Income statements, profit summaries, and expense reports at your
                fingertips.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Set up your business profile and start managing your costs
                effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Built with React, Vite, TypeScript, Tailwind CSS, ShadCN UI,
            Zustand, and Recharts
          </p>
        </div>
      </div>
    </div>
  );
}
