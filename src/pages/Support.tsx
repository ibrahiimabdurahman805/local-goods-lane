import { AppNav } from "@/components/layout/AppNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  FileQuestion,
  Shield,
  Truck,
  CreditCard,
  Send
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Support = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleSubmit = (data: ContactFormData) => {
    // Here you would typically send the validated data to your backend
    console.log("Validated contact form data:", data);
    toast({
      title: "Message Sent!",
      description: "Our support team will get back to you within 24 hours.",
    });
    form.reset();
  };

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click on 'Sign In' in the navigation bar, then select 'Sign Up'. Fill in your details and verify your email to get started."
    },
    {
      question: "How do I become a supplier?",
      answer: "After creating an account, go to your dashboard and select 'Become a Supplier'. Complete the KYC verification process by uploading your business documents."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, M-Pesa, and bank transfers through our secure payment gateway powered by Stripe."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery times vary by location. Typically, orders within Nairobi are delivered within 1-3 business days, while other regions may take 3-7 business days."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for most items. Products must be in original condition with tags attached. Contact support to initiate a return."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also view order status in your dashboard under 'My Orders'."
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      content: "support@markethub.co.ke",
      description: "Response within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      content: "+254 700 123 456",
      description: "Mon-Fri, 8AM - 6PM EAT"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      content: "Coming Soon",
      description: "Real-time assistance"
    }
  ];

  const helpTopics = [
    {
      icon: FileQuestion,
      title: "Getting Started",
      description: "Learn the basics of using MarketHub"
    },
    {
      icon: Shield,
      title: "Account Security",
      description: "Keep your account safe and secure"
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      description: "Everything about orders and delivery"
    },
    {
      icon: CreditCard,
      title: "Payments & Refunds",
      description: "Payment methods and refund process"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero Section */}
      <section className="gradient-hero py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 animate-fade-in" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            How Can We Help You?
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in-up">
            Get answers to your questions or reach out to our support team
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover-lift cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <method.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{method.title}</CardTitle>
                <CardDescription>{method.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-lg">{method.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Topics */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Popular Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpTopics.map((topic, index) => (
              <Card key={index} className="hover-lift cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <topic.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? We're here to help!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue or question..."
                      rows={5}
                      {...form.register("message")}
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.message.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-white shadow-glow hover-scale">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
