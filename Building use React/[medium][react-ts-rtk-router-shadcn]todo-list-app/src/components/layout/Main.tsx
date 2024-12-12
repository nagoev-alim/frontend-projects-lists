import { ReactNode } from 'react';

type MainProps = {
  children: ReactNode;
}

export const Main = ({ children }: MainProps) => {
  return (
    <main className="flex-grow flex flex-col p-4 xl:px-0 max-w-6xl w-full mx-auto">
      {children}
    </main>
  );
};

Main.displayName = 'Main';
