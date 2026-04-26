import Link from "next/link";

export default function MarketingLayout({ children }) {
  return (
    <>
      <nav className="flex items-center gap-4 px-4 py-3">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/login">Login</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
      {children}
      <footer className="px-4 py-4">This footer appears on marketing pages</footer>
    </>
  )
}
