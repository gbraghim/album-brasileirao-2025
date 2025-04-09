import { CldImage } from 'next-cloudinary';
import { ComponentProps } from 'react';

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

type CloudinaryImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
} & Omit<ComponentProps<typeof CldImage>, 'src' | 'alt' | 'width' | 'height'>;

export function CloudinaryImage(props: CloudinaryImageProps) {
  return <CldImage {...props} />;
} 