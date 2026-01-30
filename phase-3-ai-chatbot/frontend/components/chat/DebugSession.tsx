'use client';

export function DebugSession({ session }: { session: any }) {
  console.log('Session object:', session);
  console.log('Session keys:', Object.keys(session));
  console.log('Session.session:', session.session);
  console.log('Session.session keys:', session.session ? Object.keys(session.session) : 'undefined');
  console.log('Token:', session.session?.token);

  return null;
}
