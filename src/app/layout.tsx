import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LamboMoon - Find the Next Crypto Gems",
  description: "Discover and track the next big crypto tokens before they moon.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__supabase_session = ${JSON.stringify(session ? {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user: session.user
            } : null)};
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}