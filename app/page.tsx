'use client';

import { useState } from 'react';
import SuperAgent from './components/SuperAgent';
import PPTCreator from './components/PPTCreator';
import GoogleSheetsAgent from './components/GoogleSheetsAgent';
import { MealOutpost } from './components/meal/MealOutpost';
import Navigation from './components/Navigation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'superagent' | 'ppt' | 'sheets' | 'meals'>('superagent');

  return (
    <div className="flex flex-col h-screen bg-white">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'superagent' && <SuperAgent userId={null} />}
        {activeTab === 'ppt' && <PPTCreator />}
        {activeTab === 'sheets' && <GoogleSheetsAgent userId={null} />}
        {activeTab === 'meals' && <MealOutpost />}
      </main>
    </div>
  );
}
