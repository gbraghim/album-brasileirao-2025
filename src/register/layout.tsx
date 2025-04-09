export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800">
      {children}
    </div>
  );
} 