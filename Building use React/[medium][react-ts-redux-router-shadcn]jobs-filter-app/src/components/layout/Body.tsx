import { ReactNode } from 'react';

type BodyProps = {
  children: ReactNode
}

export const Body = ({ children }: BodyProps) => {
  return (
    <div className="flex flex-col text-foreground min-h-screen">
      {children}
    </div>
  );
};

Body.displayName = 'Body';
