import { Link } from "react-router-dom";
import { AppNav } from "@/components/layout/AppNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Share2, Link2, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

const highlights = [
  {
    title: "Connect your socials",
    description: "Link TikTok and Facebook so every new listing is ready for promotion.",
    icon: Link2,
  },
  {
    title: "One click sharing",
    description: "Toggle TikTok/Facebook when adding a product to push teasers instantly.",
    icon: Share2,
  },
  {
    title: "Scheduling built in",
    description: "Pick the exact date and time for posts to go live and keep launches coordinated.",
    icon: Clock,
  },
];

const steps = [
  "Open the Supplier Dashboard and choose Add Product or edit an existing one.",
  "Connect TikTok and Facebook once (placeholder flow today, OAuth coming soon).",
  "Toggle the platforms you want, craft your caption, and pick a schedule time.",
  "Save the product – we queue the social post and show a confirmation toast.",
];

const Socials = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container mx-auto px-4 py-12 space-y-12">
        <section className="text-center space-y-4 animate-fade-in">
          <Badge variant="secondary" className="text-sm">New feature</Badge>
          <h1 className="text-4xl font-bold tracking-tight">My Socials</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Give every product launch a social boost. Connect TikTok and Facebook, schedule posts, and
            keep your community updated automatically the moment you list something on Local Goods Lane.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="gradient-primary text-white shadow-glow" asChild>
              <Link to="/supplier/dashboard">Open Supplier Dashboard</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/products">See live listings</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="h-full animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-card/70 backdrop-blur p-8 space-y-6 animate-fade-in">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary font-semibold">How it works</p>
              <h2 className="text-2xl font-bold">Schedule socials alongside every product drop</h2>
            </div>
            <Share2 className="h-8 w-8 text-primary" />
          </div>
          <Separator />
          <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <div className="rounded-lg bg-muted p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Coming soon: secure TikTok & Facebook OAuth plus automated posting via Supabase Edge Functions.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Why sellers love it
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>✓ Save time: schedule socials during the same flow you add inventory.</p>
              <p>✓ Stay consistent: never forget to hype a drop on TikTok or Facebook.</p>
              <p>✓ Drive traffic: keep buyers engaged with fresh content synced to supply.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                What&apos;s next
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>• Analytics on clicks & conversions from social pushes.</p>
              <p>• Templates per platform so captions follow your brand voice.</p>
              <p>• Automatic repost reminders when stock levels refresh.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Socials;
