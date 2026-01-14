import { redirect } from 'next/navigation';

export default function Home() {
  // LOCAL-ONLY: Always redirect to dashboard, no auth check
  redirect('/dashboard');
}
