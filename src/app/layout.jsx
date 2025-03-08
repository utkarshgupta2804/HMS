import { SessionProvider } from "next-auth/react";
import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'HMS - Hospital Management System',
  description: 'Hospital Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
