import './globals.css';

export const metadata = {
  title: 'focus.lab'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
