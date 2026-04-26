import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/login">Login</Link>
        </nav>
        {children}  {/* The actual page content goes here */}
        <footer>This footer appears on EVERY page</footer>
      </body>
    </html>
  )
}
