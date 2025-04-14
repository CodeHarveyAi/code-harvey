export const metadata = {
  title: 'Code Harvey',
  description: 'Rewrite academic content with Claude.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
