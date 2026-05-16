import { Tailwind } from "react-email";
import * as React from "react";

interface TailwindConfigProps {
  children: React.ReactNode;
}

export function TailwindConfig({ children }: TailwindConfigProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              gray: {
                400: '#E4E4E7',
                600: '#A1A1AA'
              }
            }
          }
        }
      }}
    >
      {children}
    </Tailwind>
  );
}