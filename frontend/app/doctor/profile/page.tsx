'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Lock,
  User,
  type LucideIcon,
} from 'lucide-react';

import CalendarTab from './CalendarTab';
import PasswordTab from './PasswordTab';
import ProfileTab from './ProfileTab';
import type { Doctor } from './types';
import { Spinner } from './ui';

type Tab = 'profile' | 'password' | 'calendar';

const TABS: {
  id: Tab;
  label: string;
  icon: LucideIcon;
}[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
  },
  {
    id: 'password',
    label: 'Password',
    icon: Lock,
  },
  {
    id: 'calendar',
    label: 'Calendar Integration',
    icon: Calendar,
  },
];

function PageSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner className="h-12 w-12" />
    </div>
  );
}

const subscribeToStorage = (
  onChange: () => void
) => {
  window.addEventListener(
    'storage',
    onChange
  );

  return () =>
    window.removeEventListener(
      'storage',
      onChange
    );
};

function DoctorProfileContent() {
  const searchParams = useSearchParams();

  const calendarParam =
    searchParams.get('calendar');

  const [activeTab, setActiveTab] =
    useState<Tab>(() => {
      const tab =
        searchParams.get('tab');

      if (
        tab === 'calendar' ||
        calendarParam === 'connected'
      ) {
        return 'calendar';
      }

      if (tab === 'password') {
        return 'password';
      }

      return 'profile';
    });

  const storedUser =
    useSyncExternalStore(
      subscribeToStorage,
      () =>
        localStorage.getItem(
          'user'
        ),
      () => null
    );

  const [
    updatedDoctor,
    setUpdatedDoctor,
  ] = useState<Doctor | null>(
    null
  );

  const doctor = useMemo(() => {
    if (updatedDoctor) {
      return updatedDoctor;
    }

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(
        storedUser
      ) as Doctor;
    } catch {
      return null;
    }
  }, [
    updatedDoctor,
    storedUser,
  ]);

  useEffect(() => {
    if (
      calendarParam ===
      'connected'
    ) {
      alert(
        'Google Calendar connected successfully!'
      );
    } else if (
      calendarParam === 'error'
    ) {
      alert(
        'Failed to connect Google Calendar. Please try again.'
      );
    }
  }, [calendarParam]);

  const updateDoctor = (
    updated: Doctor
  ) => {
    setUpdatedDoctor(
      updated
    );

    localStorage.setItem(
      'user',
      JSON.stringify(
        updated
      )
    );
  };

  if (!doctor) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Profile & Settings
        </h1>

        <p className="text-slate-500">
          Manage your account
          information and
          preferences
        </p>
      </div>

      <div className="flex items-center space-x-6 border-b border-gray-200">
        {TABS.map(
          ({
            id,
            label,
            icon: Icon,
          }) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                setActiveTab(id)
              }
              className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all ${
                activeTab === id
                  ? 'border-b-2 border-teal-700 text-teal-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>
                {label}
              </span>
            </button>
          )
        )}
      </div>

      {activeTab ===
        'profile' && (
        <ProfileTab
          doctor={doctor}
          onDoctorUpdate={
            updateDoctor
          }
        />
      )}

      {activeTab ===
        'password' && (
        <PasswordTab />
      )}

      {activeTab ===
        'calendar' && (
        <CalendarTab />
      )}
    </div>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense
      fallback={
        <PageSpinner />
      }
    >
      <DoctorProfileContent />
    </Suspense>
  );
}