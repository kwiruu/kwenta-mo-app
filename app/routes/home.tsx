import { Link } from "react-router";
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
import { BarChart3, FileUp, PieChart, ArrowRight } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${APP_CONFIG.name} - Food Business Costing Assistant` },
    { name: "description", content: APP_CONFIG.description },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-lg text-primary">
              {APP_CONFIG.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="bg-greenz" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
              Smart Costing for Your
              <span className="text-primary"> Food Business</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              {APP_CONFIG.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-base px-8 bg-greenz"
                asChild
              >
                <Link to="/register">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-20 px-6 bg-gray-50/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
                Everything you need to manage costs
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Simple tools designed for small food business owners in Cebu
                City
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-medium">
                    Cost Management
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Track ingredients, labor, and overhead expenses with ease
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Accurately compute COGS, operating expenses, and profit
                    margins for your food products.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                    <FileUp className="h-5 w-5 text-secondary" />
                  </div>
                  <CardTitle className="text-lg font-medium">
                    Bulk Upload
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Import data from Excel or CSV files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Save time by uploading ingredients, expenses, and sales data
                    in bulk.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <PieChart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-medium">
                    Financial Reports
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Generate comprehensive financial statements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Income statements, profit summaries, and expense reports at
                    your fingertips.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-500 mb-8">
              Set up your business profile and start managing your costs
              effectively
            </p>
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="container mx-auto text-center text-sm text-gray-400">
          <p>
            © 2025 {APP_CONFIG.name}. A capstone project for BSBA Financial
            Management students.
          </p>
        </div>
      </footer>
    </div>
  );
}
