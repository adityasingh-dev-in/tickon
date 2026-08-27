import React from 'react';
import {
  Layers,
  Database,
  Server,
  LayoutDashboard,
  Zap,
  Code2,
  FolderGit2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const stackModules = [
    {
      title: 'Next.js 15 App Router',
      category: 'Frontend',
      description: 'React 19, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form, and Zod.',
      icon: LayoutDashboard,
      status: 'Ready',
    },
    {
      title: 'NestJS 11 Core API',
      category: 'Backend',
      description: 'Modular enterprise architecture, Helmet security, Throttling, and Validation Pipes.',
      icon: Server,
      status: 'Ready',
    },
    {
      title: 'Prisma 7 + PostgreSQL',
      category: 'Database',
      description: 'Relational data models with type-safe client generation, migrations, and indexing.',
      icon: Database,
      status: 'Ready',
    },
    {
      title: 'Turborepo Monorepo',
      category: 'Tooling',
      description: 'Unified pnpm workspace orchestration, pipeline caching, and shared TypeScript types.',
      icon: FolderGit2,
      status: 'Ready',
    },
  ];

  const quickLinks = [
    { name: 'Architecture & System Diagrams', path: 'docs/02-architecture/01-system-diagram.md' },
    { name: 'Database Models & Prisma Spec', path: 'apps/server/prisma/schema.prisma' },
    { name: 'Shared Type Definitions', path: 'packages/types/src/index.ts' },
    { name: 'Local Environment Setup', path: 'docs/01-onboarding/03-local-setup.md' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Tickon</span>
            <Badge variant="secondary" className="ml-2 font-mono text-[10px]">
              v0.1.0-dev
            </Badge>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="success" className="gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Initial Setup Complete
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Fullstack Workspace Initialized & Verified
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Ready to Build{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
              Production-Grade
            </span>{' '}
            Features
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            The monorepo architecture, type-safe API contracts, database schemas, and modern component systems are fully scaffolded and verified.
          </p>
        </div>

        {/* Core Stack Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {stackModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="hover:border-slate-700 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {module.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Documentation & Getting Started Bar */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Reference & Next Steps
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <div
                key={link.name}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/40 transition-colors"
              >
                <div className="text-xs font-medium text-slate-200 mb-1">{link.name}</div>
                <div className="text-[11px] font-mono text-slate-500 truncate">{link.path}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        Tickon Monorepo • Clean Architecture • Next.js & NestJS
      </footer>
    </main>
  );
}
