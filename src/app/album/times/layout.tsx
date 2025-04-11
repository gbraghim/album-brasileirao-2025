import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function TimesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
} 