"use client";
import Link from "next/link";
import { Sprout, Bug, Beaker, TrendingUp, ArrowRight, Sparkles, CheckCircle, Users, Target, Eye, Globe, Zap, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
export default function Home() {
  const { t } = useLanguage();
  const features = [
    {
      icon: Sprout,
      title: t.features.crop.title,
      description: t.features.crop.description,
      href: "/crop",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Bug,
      title: t.features.disease.title,
      description: t.features.disease.description,
      href: "/disease",
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Beaker,
      title: t.features.fertilizer.title,
      description: t.features.fertilizer.description,
      href: "/fertilizer",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: TrendingUp,
      title: t.features.yield.title,
      description: t.features.yield.description,
      href: "/yield",
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
    },
  ];
  const benefits = [
    { icon: Target, title: t.benefits.benefit1.title, description: t.benefits.benefit1.description },
    { icon: Zap, title: t.benefits.benefit2.title, description: t.benefits.benefit2.description },
    { icon: TrendingUp, title: t.benefits.benefit3.title, description: t.benefits.benefit3.description },
    { icon: CheckCircle, title: t.benefits.benefit4.title, description: t.benefits.benefit4.description },
    { icon: Globe, title: t.benefits.benefit5.title, description: t.benefits.benefit5.description },
    { icon: Shield, title: t.benefits.benefit6.title, description: t.benefits.benefit6.description },
  ];
  const steps = [
    { number: "1", title: t.howItWorks.step1.title, description: t.howItWorks.step1.description },
    { number: "2", title: t.howItWorks.step2.title, description: t.howItWorks.step2.description },
    { number: "3", title: t.howItWorks.step3.title, description: t.howItWorks.step3.description },
    { number: "4", title: t.howItWorks.step4.title, description: t.howItWorks.step4.description },
  ];
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>{t.hero.badge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            {t.hero.title}{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AgroAI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              {t.hero.getStarted}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-green-600 hover:shadow-lg transition-all duration-200"
            >
              {t.hero.learnMore}
            </Link>
          </div>
        </div>
      </section>
      <section id="about" className="container mx-auto px-4 py-20 bg-white/50 backdrop-blur-sm rounded-3xl my-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t.about.title}
            </h2>
            <p className="text-xl text-green-600 font-semibold mb-6">
              {t.about.subtitle}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.about.description}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">{t.about.mission}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t.about.missionText}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">{t.about.vision}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t.about.visionText}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-6`}>
                  <feature.icon className="w-8 h-8 text-gray-700" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:gap-3 transition-all">
                  <span>{t.features.crop.tryNow}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.howItWorks.title}
          </h2>
          <p className="text-xl text-gray-600">
            {t.howItWorks.subtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-green-300" />
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 py-20 bg-white/50 backdrop-blur-sm rounded-3xl my-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.benefits.title}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <benefit.icon className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 md:p-16 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">4</div>
              <div className="text-green-100 text-lg">{t.stats.tools}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%+</div>
              <div className="text-green-100 text-lg">{t.stats.accuracy}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">GPU</div>
              <div className="text-green-100 text-lg">{t.stats.gpu}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 md:p-16 text-center border-2 border-green-200">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.hero.getStarted}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.about.description}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Users className="w-5 h-5" />
            <span>{t.nav.signup}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
