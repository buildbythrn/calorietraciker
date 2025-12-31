'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Target, Dumbbell, Flame, TrendingUp, Smartphone, Zap, Shield, Heart, Brain, TrendingDown, Apple, Droplet, CheckCircle2, XCircle } from 'lucide-react';
import PetMascot from './mascots/PetMascot';

export default function WelcomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [heroPetMood, setHeroPetMood] = useState<'happy' | 'excited' | 'hungry'>('happy');

  useEffect(() => {
    setMounted(true);
    
    // Cycle through pet moods
    const heroInterval = setInterval(() => {
      setHeroPetMood(prev => {
        const moods: Array<'happy' | 'excited' | 'hungry'> = ['happy', 'excited', 'hungry'];
        const currentIndex = moods.indexOf(prev);
        return moods[(currentIndex + 1) % moods.length];
      });
    }, 4000);

    return () => {
      clearInterval(heroInterval);
    };
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Calorie Tracking',
      description: 'Track your daily food intake with detailed calorie information and meal categorization.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: Target,
      title: 'Habit Tracking',
      description: 'Build healthy habits with daily tracking and streak visualization to stay motivated.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Dumbbell,
      title: 'Workout Logging',
      description: 'Record your workouts, track duration, calories burned, and maintain your fitness streak.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Flame,
      title: 'Streak Tracking',
      description: 'Stay motivated with streak counters for both habits and workouts. Build consistency!',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'View your progress over time with intuitive dashboards and insights.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Works seamlessly on web and mobile. Install as a PWA for app-like experience.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center transform transition-transform hover:rotate-12 hover:scale-110">
              <Calendar className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FitFlow</h1>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-all transform hover:scale-105"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Mascot in Hero */}
          <div className={`flex justify-center mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <PetMascot petType="panda" size="lg" iconType="default" mood={heroPetMood} className="animate-float" />
          </div>
          
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Track Your Health Journey
            <span className="block text-primary-600 dark:text-primary-400 mt-2">One Day at a Time</span>
          </h2>
          <p className={`text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            A comprehensive health and fitness tracking app that helps you monitor calories, 
            build habits, and log workouts—all in one place.
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 button-pulse"
            >
              Get Started Free
            </button>
            <button
              onClick={() => {
                const featuresSection = document.getElementById('features');
                featuresSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-all transform hover:scale-105"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          {/* Mascot in Features Section */}
          <div className="flex justify-center mb-6">
            <PetMascot petType="dog" size="md" iconType="food" mood="happy" className="animate-float" />
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
            Everything You Need to Succeed
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Powerful features designed to help you achieve your health and fitness goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const staggerClass = `animate-stagger-${(index % 6) + 1}`;
            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 hover:scale-105 ${mounted ? staggerClass : 'opacity-0'}`}
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 transform transition-transform hover:rotate-12`}>
                  <Icon className={feature.color} size={24} />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fitness Education Section */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <PetMascot petType="cat" size="md" iconType="workout" mood="energetic" className="animate-float" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
                💪 Understanding Your Fitness Journey
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Learn how workouts transform your body and mind
              </p>
            </div>

            {/* Benefits of Working Out */}
            <div className="mb-16">
              <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center animate-fade-in-up">
                Benefits of Working Out
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Physical Benefits */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-in-left hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Heart className="text-red-600 dark:text-red-400" size={24} />
                    </div>
                    <h5 className="text-xl font-semibold text-gray-900 dark:text-white">Physical Benefits</h5>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Improves strength & endurance</strong> – muscles and stamina increase</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Better heart health</strong> – lowers blood pressure, improves circulation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Stronger bones & joints</strong> – reduces injury and osteoporosis risk</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Better posture & mobility</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Boosts metabolism</strong> – you burn more calories even at rest</span>
                    </li>
                  </ul>
                </div>

                {/* Mental & Emotional Benefits */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-in-right hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Brain className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <h5 className="text-xl font-semibold text-gray-900 dark:text-white">Mental & Emotional Benefits</h5>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Reduces stress, anxiety, and depression</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Improves sleep quality</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Boosts confidence and self-esteem</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Releases endorphins</strong> (feel-good hormones)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0" size={20} />
                      <span className="text-gray-700 dark:text-gray-300"><strong>Improves focus and energy levels</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white dark:bg-gray-800 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
                Why Choose FitFlow?
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center animate-stagger-1 hover:transform hover:-translate-y-2 transition-all">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:rotate-12 hover:scale-110">
                  <Zap className="text-primary-600 dark:text-primary-400" size={32} />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fast & Easy</h4>
                <p className="text-gray-600 dark:text-gray-300">Quick setup, intuitive interface. Start tracking in seconds.</p>
              </div>
              <div className="text-center animate-stagger-2 hover:transform hover:-translate-y-2 transition-all">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:rotate-12 hover:scale-110">
                  <Shield className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h4>
                <p className="text-gray-600 dark:text-gray-300">Your data is encrypted and stored securely. Privacy first.</p>
              </div>
              <div className="text-center animate-stagger-3 hover:transform hover:-translate-y-2 transition-all">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:rotate-12 hover:scale-110">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h4>
                <p className="text-gray-600 dark:text-gray-300">Visualize your journey with streaks and analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-600 py-16 sm:py-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Mascot in CTA */}
          <div className="flex justify-center mb-6">
            <PetMascot petType="panda" size="lg" iconType="default" mood="excited" className="animate-float" />
          </div>
          
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in-up">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Join thousands of users tracking their health and fitness goals. It's free to get started!
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 button-pulse animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 FitFlow</p>
        </div>
      </footer>
    </div>
  );
}

