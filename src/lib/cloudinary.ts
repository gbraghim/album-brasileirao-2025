import { CldImage } from 'next-cloudinary';
import { ComponentProps } from 'react';

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

interface CloudinaryImageProps extends ComponentProps<typeof CldImage> {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function CloudinaryImage({ 
  src, 
  alt, 
  width, 
  height,
  ...props 
}: CloudinaryImageProps) {
  return (
    <CldImage
      width={width}
      height={height}
      src={src}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
} 