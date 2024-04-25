import NextImage from 'next/image';

export type ImageProps = {
  src: string;
  alt: string;
};

export const Image = ({ src, alt }: ImageProps) => (
  <div className="bg-white rounded-md mt-6 first:mt-0">
    <NextImage
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes="100vw"
      style={{ width: '100%', height: 'auto' }}
    />
  </div>
);
