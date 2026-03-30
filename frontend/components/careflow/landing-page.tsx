"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  ArrowRight,
  Brain,
  ChartBar,
  CheckCircle2,
  Globe2,
  Heart,
  LineChart,
  MessageSquareText,
  Shield,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

interface LandingPageProps {
  onEnterDashboard: () => void
}

export function LandingPage({ onEnterDashboard }: LandingPageProps) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full animate-glow-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full animate-glow-pulse animation-delay-500" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-risk-stable rounded-full animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-foreground">CareFlow</span>
            <span className="text-lg font-light text-primary">AI</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
          <a href="#impact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Impact
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-sm">
            Sign In
          </Button>
          <Button size="sm" className="gap-2" onClick={onEnterDashboard}>
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="animate-slide-up">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium gap-2 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  NCD Predictive Operating System
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] animate-slide-up animation-delay-100">
                <span className="text-balance">AI-Powered Risk Prediction for</span>{" "}
                <span className="text-primary">Global Health</span>
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl animate-slide-up animation-delay-200 text-pretty">
                Empower NGO health workers with real-time NCD risk stratification, explainable AI insights, and evidence-based clinical guidance. Transform patient outcomes at scale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-300">
                <Button 
                  size="lg" 
                  className="gap-2 text-base px-8 h-12"
                  onClick={onEnterDashboard}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <Brain className={`w-5 h-5 transition-transform ${isHovering ? 'scale-110' : ''}`} />
                  Enter Dashboard
                  <ArrowRight className={`w-4 h-4 transition-transform ${isHovering ? 'translate-x-1' : ''}`} />
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
                  <MessageSquareText className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 animate-slide-up animation-delay-400">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe2 className="w-4 h-4 text-primary" />
                  <span>WHO Guidelines</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Real-time Analysis</span>
                </div>
              </div>
            </div>

            {/* Right Visual - Dashboard Preview */}
            <div className="relative animate-slide-in-right animation-delay-200">
              <div className="relative rounded-2xl overflow-hidden glass-card shadow-2xl shadow-primary/10">
                {/* Mock Dashboard Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-risk-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-risk-stable/60" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">CareFlow AI Dashboard</span>
                </div>

                {/* Mock Dashboard Content */}
                <div className="p-4 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Active Patients", value: "2,847", icon: Users, color: "text-primary" },
                      { label: "High Risk", value: "142", icon: Activity, color: "text-destructive" },
                      { label: "Predicted Events", value: "23", icon: TrendingUp, color: "text-risk-warning" },
                    ].map((stat, i) => (
                      <div 
                        key={stat.label} 
                        className={`p-3 rounded-xl bg-card border border-border/50 animate-scale-in`}
                        style={{ animationDelay: `${400 + i * 100}ms` }}
                      >
                        <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                        <div className="text-xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Patient Table Preview */}
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border/50">
                      <span className="text-xs font-medium text-foreground">Priority Triage Queue</span>
                    </div>
                    <div className="divide-y divide-border/50">
                      {[
                        { name: "Maria Santos", risk: 87, status: "Critical" },
                        { name: "John Okello", risk: 72, status: "Warning" },
                        { name: "Fatima Ahmed", risk: 45, status: "Stable" },
                      ].map((patient, i) => (
                        <div 
                          key={patient.name} 
                          className={`flex items-center justify-between px-3 py-2.5 animate-slide-up`}
                          style={{ animationDelay: `${600 + i * 100}ms` }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">{patient.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{patient.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  patient.risk >= 70 ? 'bg-destructive' : 
                                  patient.risk >= 50 ? 'bg-risk-warning' : 'bg-risk-stable'
                                }`}
                                style={{ width: `${patient.risk}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              patient.status === 'Critical' ? 'text-destructive' :
                              patient.status === 'Warning' ? 'text-risk-warning' : 'text-risk-stable'
                            }`}>
                              {patient.risk}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insight Preview */}
                  <div 
                    className="rounded-xl bg-primary/5 border border-primary/20 p-3 animate-scale-in"
                    style={{ animationDelay: '900ms' }}
                  >
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-primary mt-0.5 animate-pulse" />
                      <div>
                        <div className="text-xs font-medium text-primary mb-1">AI Insight</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {"3 patients show elevated cardiovascular risk. Consider scheduling BP monitoring within 48 hours."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 animate-float">
                <div className="glass-card rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-medium">CVD Risk Model</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 animate-float animation-delay-300">
                <div className="glass-card rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <ChartBar className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">SHAP Explainability</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 lg:px-12 py-16 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Patients Screened", icon: Users },
              { value: "94%", label: "Prediction Accuracy", icon: CheckCircle2 },
              { value: "12", label: "Countries Deployed", icon: Globe2 },
              { value: "30%", label: "Reduced Hospitalizations", icon: TrendingUp },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className={`text-center animate-slide-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Everything You Need for Predictive Health Operations
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Purpose-built for NGO health workers managing NCD programs in resource-limited settings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Risk Stratification",
                description: "Multi-model ensemble predicts CVD, diabetes, and CKD risk using clinical and demographic data.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: ChartBar,
                title: "SHAP Explainability",
                description: "Transparent AI with per-patient feature attribution showing exactly why risks were calculated.",
                color: "bg-chart-2/10 text-chart-2",
              },
              {
                icon: MessageSquareText,
                title: "Clinical Copilot",
                description: "RAG-powered assistant with WHO/IHME guidelines provides evidence-based care recommendations.",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: LineChart,
                title: "Macro-Level Radar",
                description: "Population health dashboards with real-time triage queues and dispatch management.",
                color: "bg-risk-warning/10 text-risk-warning",
              },
              {
                icon: Stethoscope,
                title: "Patient Deep-Dive",
                description: "Individual patient profiles with vitals tracking, trends, and AI-suggested interventions.",
                color: "bg-risk-stable/10 text-risk-stable",
              },
              {
                icon: Shield,
                title: "Offline-First Design",
                description: "Works in low-connectivity environments with automatic sync when connection is restored.",
                color: "bg-muted-foreground/10 text-muted-foreground",
              },
            ].map((feature, i) => (
              <div 
                key={feature.title}
                className={`group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 lg:px-12 py-20 lg:py-28 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              From Data to Life-Saving Decisions
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Ingest Patient Data",
                description: "Upload clinical measurements, demographics, and health history. Supports CSV, EMR integrations, and mobile data collection.",
              },
              {
                step: "02",
                title: "AI Risk Analysis",
                description: "Ensemble models analyze data to generate risk scores with full SHAP-based explainability for each patient.",
              },
              {
                step: "03",
                title: "Act on Insights",
                description: "Prioritize high-risk patients, dispatch field workers, and use Clinical Copilot for guideline-based care plans.",
              },
            ].map((step, i) => (
              <div 
                key={step.step} 
                className={`relative animate-slide-up`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-7xl font-bold text-primary/10 absolute -top-4 -left-2">{step.step}</div>
                <div className="relative pt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Activity className="w-4 h-4 animate-pulse" />
            Ready to transform patient outcomes?
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Start Predicting Risk, Saving Lives
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
            Join leading NGOs using CareFlow AI to deliver proactive, AI-powered healthcare to communities worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 text-base px-10 h-14"
              onClick={onEnterDashboard}
            >
              <Brain className="w-5 h-5" />
              Launch Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-base px-10 h-14">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">CareFlow<span className="font-light text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="text-sm text-muted-foreground">
            Built for Global Health
          </div>
        </div>
      </footer>
    </div>
  )
}
