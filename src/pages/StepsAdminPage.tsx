import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { RouteFundsManager, ParticipantStepsEditor } from '../features/steps/components';
import { usePermissions } from '../hooks/usePermissions';
import { cc } from '../styles/shared';

/**
 * StepsAdminPage
 * Admin interface for managing Steps system
 */
export function StepsAdminPage() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'funds' | 'participants'>('funds');

  // Check admin permissions
  if (!hasPermission('steps', 'write')) {
    return (
      <div className="space-y-6">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <HomeIcon className="w-4 h-4 mr-2.5" />
                Dashboard
              </Link>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  Stappen Beheer
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Geen Toegang
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            Je hebt geen toestemming om toegang te krijgen tot de stappen beheer functionaliteit.
            Neem contact op met een administrator als je deze toegang nodig hebt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              <HomeIcon className="w-4 h-4 mr-2.5" />
              Dashboard
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                Stappen Beheer
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Stappen Beheer</h1>
            <p className="text-indigo-100 dark:text-indigo-200 mt-1">
              Beheer route fondsen en deelnemer stappen
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('funds')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${cc.transition.colors} ${
                activeTab === 'funds'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Route Fondsen
              </span>
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${cc.transition.colors} ${
                activeTab === 'participants'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Deelnemer Stappen
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'funds' && <RouteFundsManager />}
          {activeTab === 'participants' && <ParticipantStepsEditor />}
        </div>
      </div>
    </div>
  );
}