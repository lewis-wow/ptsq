export type VideoProps = {
  src: string;
};

export const Video = ({ src }: VideoProps) => (
  <div className="hidden sm:block p-4 w-full aspect-video">
    <video autoPlay muted loop>
      <source src={src} type="video/mp4" />
    </video>
  </div>
);
