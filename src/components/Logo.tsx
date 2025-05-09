import Image from 'next/image';

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Álbum Brasileirão 2025"
      width={150}
      height={50}
      className="h-auto w-auto"
    />
  );
} 